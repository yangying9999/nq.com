// JavaScript favorite
function addFavorite(url,title){
  if(window.sidebar||window.opera)return true;
  try{
    window.external.AddFavorite(url,title);
  }
  catch(e){
    alert("请按下 Ctrl + D 键将本站加入收藏。");
  }
  return false;
}