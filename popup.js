const buttonStartParse = document.querySelector('.start-parse');
const buttonStopParse = document.querySelector('.stop-parse');
const buttonStartTest = document.querySelector('.start-test');

const waitWhile = async (time) => {
  return new Promise(resolve => setTimeout(resolve, time));
}

const getCurrentTab = async () => {
  let queryOptions = { active: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
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

const injectScrollChatListToBottom = async (tab) => {
  const {id} = tab;

  const injectionResults = await chrome.scripting
    .executeScript({
      target : {tabId : id, allFrames : true},
      func : scrollChatListToBottom,
    });

  for (const frameResult of injectionResults) {
    const {frameId, result} = frameResult;
    console.log(`Frame ${frameId} result:`, result);
  }
}

const parseChatList = async () => {
  const chats = Array.from(document.querySelectorAll('.chatlist > a'));
  return chats.map((item) => item.href).filter(item => !!item); // maybe empty links
}

const injectParseChatList = async (tab) => {
  const {id} = tab;

  const injectionResults = await chrome.scripting
    .executeScript({
      target : {tabId : id, allFrames : true},
      func : parseChatList,
    });

  for (const frameResult of injectionResults) {
    const {frameId, result} = frameResult;
    console.log(`Frame ${frameId} result:`, result);
  }

  return injectionResults;
}

const openChat = async (chatUrl) => {
  if (chatUrl && location !== chatUrl) {
    open(chatUrl, '_self');
    return 'Chat opened!';
  }
}

const injectOpenChat = async (tab, chatUrl) => {
  const {id} = tab;

  const injectionResults = await chrome.scripting
    .executeScript({
      target : {tabId : id, allFrames : true},
      func : openChat,
      args : [ chatUrl ],
    });

  for (const frameResult of injectionResults) {
    const {frameId, result} = frameResult;
    console.log(`Frame ${frameId} result:`, result);
  }

  return injectionResults;
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

const injectParseChat = async (tab) => {
  const {id} = tab;

  const injectionResults = await chrome.scripting
    .executeScript({
      target : {tabId : id, allFrames : true},
      func : parseChat,
    });

  for (const frameResult of injectionResults) {
    const {frameId, result} = frameResult;
    console.log(`Frame ${frameId} result:`, result);
  }

  return injectionResults;
}

// work with active tab
// buttonStartParse.addEventListener('click', async () => {
//   const parseResult = [];

//   const currentTab = await getCurrentTab();
//   await injectScrollChatListToBottom(currentTab);

//   const [chatListUrls] = await injectParseChatList(currentTab);

//   for (const chatUrl of chatListUrls.result.slice(0, 10)) {
//     await injectOpenChat(currentTab, chatUrl);
//     await waitWhile(10000);
//     const [parseChatResult] = await injectParseChat(currentTab);
//     await fetch('https://localhost:7000/api/tgmessages', {
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       method: 'POST',
//       body: JSON.stringify(parseChatResult.result),
//     })
//     // parseResult.push(...parseChatResult.result);
//   }

//   // console.log(parseResult);
// });

buttonStartParse.addEventListener('click', async () => {
  const testObject = { chatLoadingDelay: 10000, serverUrl: 'https://localhost:7000/api/tgmessages' };
  chrome.runtime.sendMessage(`START_PARSE|${JSON.stringify(testObject)}`, (response) => {
    console.log('STATUS: ', response);
  });
});

buttonStopParse.addEventListener('click', async () => {
  await chrome.storage.local.set({ info: `go to stop ${Math.random() * 100}` });
  chrome.runtime.sendMessage(`STOP_PARSE`, (response) => {
    console.log('STATUS: ', response);
  });
});



///////////////////////////////////////////////////////

let flag = false;
buttonStartTest.addEventListener('click', () => {
  // chrome.runtime.sendMessage('get-user-data', (response) => {
  //   // 3. Got an asynchronous response with the data from the service worker
  //   console.log('received user data', response);
  //   initializeUI(response);
  // });

  // async function unregisterAllDynamicContentScripts() {
  //   try {
  //     const scripts = await chrome.scripting.getRegisteredContentScripts();
  //     const scriptIds = scripts.map(script => script.id);
  //     return chrome.scripting.unregisterContentScripts(scriptIds);
  //   } catch (error) {
  //     const message = [
  //       "An unexpected error occurred while",
  //       "unregistering dynamic content scripts.",
  //     ].join(" ");
  //     throw new Error(message, {cause : error});
  //   }
  // }
  // unregisterAllDynamicContentScripts();
  flag = true;
})

const test1 = async () => {
  for (let index = 0; index < 10; index++) {
    if(flag) {
      console.log('Time to stop!');
      break;
    }
    console.log('some action done, wait 3sec');
    await waitWhile(3000);
  }
};
// test1();
///////////////////////////////////////////////////////