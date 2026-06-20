const getOnparadeNewsList = (url) => {
  return getFriendsNewsList(url);
};

const getOnparadeCardList = (url) => {
  return getFriendsCardList(url);
};

function __test_getOnparadeNewsList() {
  Logger.log(JSON.stringify(getOnparadeNewsList('https://www.aikatsu.com/onparade/'), null, '  '));
}

function __test_getOnparadeCardList() {
  Logger.log(JSON.stringify(getOnparadeCardList('https://www.aikatsu.com/onparade/cardlist/index.php?search=true&category=491701'), null, '  '));
}
