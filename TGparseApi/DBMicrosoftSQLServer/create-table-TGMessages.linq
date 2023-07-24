<Query Kind="SQL">
  <Connection>
    <ID>894e803b-fe1d-4eb9-a67d-668276a4b223</ID>
    <NamingServiceVersion>2</NamingServiceVersion>
    <Persist>true</Persist>
    <Server>.\</Server>
    <AllowDateOnlyTimeOnly>true</AllowDateOnlyTimeOnly>
    <SqlSecurity>true</SqlSecurity>
    <UserName>sa</UserName>
    <Password>AQAAANCMnd8BFdERjHoAwE/Cl+sBAAAAo794e4XiQk6kB7S2z6rCVgAAAAACAAAAAAAQZgAAAAEAACAAAABe6+2NCMgtpaUpWWJ6/BK24ywQFV0JhV+3/Cq17B4iqAAAAAAOgAAAAAIAACAAAAAobNYxZ+DLXpEvgzgEoFzr+Q2j7A8x+3lwbo1SlgtabxAAAACI0LF8YCzxjz7uIahQvptqQAAAAM5NES+7MZKqni/1MBfQPVtjhlqwC+jwI4AhCGlV1R5c4u7qnl7XFWWSUX+ysjOO7XgJKsrhQc2NGamiQs9yKVo=</Password>
    <Database>tgparse</Database>
    <DriverData>
      <LegacyMFA>false</LegacyMFA>
    </DriverData>
  </Connection>
</Query>

--CREATE DATABASE tgparse;

CREATE TABLE TGMessages
(
	Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
	MId NVARCHAR(max) NOT NULL,
	PeerId NVARCHAR(max) NOT NULL,
	Timestamp NVARCHAR(max) NOT NULL,
	MessageRichHTML NVARCHAR(max),
	MediaPhotoPaths NVARCHAR(max),
);

GO

INSERT INTO TGMessages(Id, MId, PeerId, Timestamp, MessageRichHTML, MediaPhotoPaths) VALUES
	(DEFAULT, '32131', '123', '2022.11.1', N'<a>test<d>', '1;2'),
	(DEFAULT, '1113', '123', '2022.12.1', N'<a>年月日test<d>', '2'),
	(DEFAULT, '323111', '123', '2022.12.4', '<a>фывыфвTest<d>', '3');

GO

SELECT * FROM TGMessages;