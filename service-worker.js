// chrome.runtime.onInstalled.addListener(() => {
//   console.log('onInstalled');
//   chrome.contextMenus.create({
//     "id": "sampleContextMenu",
//     "title": "Sample Context Menu",
//     "contexts": ["selection"]
//   });
// });

// chrome.runtime.onStartup.addListener(() => {
//     console.log('onStartup');
//     // ??? why do not work
//   },
// );

// chrome.tabs.create({url:"popup.html"});

const getCurrentTab = async () => {
  let queryOptions = { active: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

const contentScript = async (options) => {
  // START CONTEXT SCRIPTS
  const waitWhile = async (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  const scrollChatListToBottom = async () => {
    const scrollableChatList = document.querySelector('div.scrollable.scrollable-y.tabs-tab.chatlist-parts.active');
    if (scrollableChatList) {
      let prevScrollHeight = 0;
  
      return new Promise(resolve => {
        const interval = setInterval(() => {
          if (scrollableChatList.scrollHeight > prevScrollHeight) {
            prevScrollHeight = scrollableChatList.scrollHeight;
            scrollableChatList.scroll(0, scrollableChatList.scrollHeight)
          } else {
            clearInterval(interval);
            resolve('Scroll to bottom complete!');
            // console.log('TIME TO CLOSE, next parseChatList');
            // setTimeout(parseChatList, 800); // call next stage parse
          }
          
        }, 800);
      })
    }
  }

  const parseChatList = async () => {
    const chats = Array.from(document.querySelectorAll('.chatlist > a'));
    return chats.map((item) => item.href).filter(item => !!item); // maybe empty links
  }

  const openChat = async (chatUrl) => {
    if (chatUrl && location !== chatUrl) {
      open(chatUrl, '_self');
      return 'Chat opened!';
    }
  }

  // without auto scroll!
  const parseChat = async () => {
    const imgToDataBase64 = (imgElement) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const realImg = document.createElement('img');
      realImg.src = imgElement.src;
      canvas.width = realImg.width;
      canvas.height = realImg.height;
      context.drawImage(realImg, 0, 0);
      return context.canvas.toDataURL('image/png', 1);
    };

    let bubblesDateGroups = Array.from(document.querySelectorAll('.bubbles-date-group'));
    
    // split bubblesDateGroup with "Unread messages"
    const splitIndex = bubblesDateGroups.findIndex((item) => item.querySelector('.bubble.is-first-unread'));
    // if index=-1 select last bubblesDateGroup in array
    bubblesDateGroups = bubblesDateGroups.slice(splitIndex);
    // console.log(bubblesDateGroup);
    
    const parsedData = bubblesDateGroups.map((bubblesDateGroup) => {
      // get message containers from bubbles-group
      return Array.from(bubblesDateGroup.querySelectorAll('.bubbles-group [data-mid][data-peer-id]')).map((post) => {
        const message = post.querySelector('.message'); // null if bubbles-group has system message (info invite member message, ...)
        const mediaPhotos = Array.from(post.querySelectorAll('.media-photo')).map(imgToDataBase64);
        return {
          mId: post.getAttribute('data-mid'),
          peerId: post.getAttribute('data-peer-id'),
          timestamp: post.getAttribute('data-timestamp'),
          messageRichHTML: message?.innerHTML ?? 'system message',
          mediaPhotos
        }
      })
    }).flat();
    // console.log(parsedData);
    return parsedData;
  }
  //END CONTEXT SCRIPTS

  // Long-lived connection
  let stopFlag = false;
  const port = chrome.runtime.connect({name: "CONTROL_BRIDGE"});
  port.onMessage.addListener((msg) => {
    if (msg.command === `STOP`) {
      stopFlag = !stopFlag;
    }
  });

  const parseResult = [];

  // if not have saved chats on the server
  await scrollChatListToBottom();
  const chatListUrls = await parseChatList();

  for (const chatUrl of chatListUrls.slice(0, 6)) {
    if (stopFlag) {
      port.postMessage({command: `INFO: STOP`});
      const stopInfo = await chrome.storage.local.get(["info"]);
      console.log("Info: " + stopInfo.info);
      break;
    }

    console.log(chatUrl);
    await openChat(chatUrl);
    await waitWhile(options.chatLoadingDelay);
    const parseChatResult = await parseChat();
    try {
      await fetch(options.serverUrl, {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(parseChatResult),
      });
    } catch {
      alert('Server is not available');
    }
    
    // parseResult.push(...parseChatResult);
  }

  // console.log(parseResult);
  port.disconnect();
};

const injectContentScript = async (options) => {
  const {id} = await getCurrentTab();

  const injectionResults = await chrome.scripting
    .executeScript({
      target : {tabId : id, allFrames : true},
      func : contentScript,
      args : [ options ],
    });

  for (const frameResult of injectionResults) {
    const {frameId, result} = frameResult;
    console.log(`Frame ${frameId} result:`, result);
  }

  return injectionResults;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.startsWith('START_PARSE')) {
    console.log(message);
    const data = message.split(`|`);
    injectContentScript(JSON.parse(data[data.length - 1]));
    sendResponse('parsing started');
  }
});

chrome.runtime.onConnect.addListener((port) => {
  console.assert(port.name === "CONTROL_BRIDGE"); // throw error if not true condition

  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.startsWith('STOP_PARSE')) {
      port.postMessage({command: `STOP`}); // from popup it called
      sendResponse('parsing stopping');
    }
  });
  
  port.onMessage.addListener((msg) => {
    if (msg.command === `INFO: STOP`) {
      console.log(`INFO: STOP in port`)
    }
  });

  port.onDisconnect.addListener((port) => {
    console.log('connection stopped', port.name);
  });
});