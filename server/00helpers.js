checkMeteorId = Match.Where(function(x){
  if (x === null) return false;
  check(x,String);
  return /^[0-9A-Za-z]{17}$/.test(x);
});
