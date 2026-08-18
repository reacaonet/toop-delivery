const getRandom = (number) => {
  var s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let generate = Array(number).join().split(',').map(function() {
    return s.charAt(Math.floor(Math.random() * s.length));
  }).join('');


  let current = new Date().getTime();
  return `${generate}${current}`;
};

module.exports = getRandom;
