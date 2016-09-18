var mongodb = require('./db');


function News(title, content, pic) {
  this.title = title;
  this.content = content;
  this.pic = pic;//保存存储路径
};

module.exports = News;

//存储数据
News.prototype = {
  save: function (callback) {
    var date = new Date();
    var time = {
      date: date,
      year: date.getFullYear(),
      month: date.getFullYear() + "-" + (date.getMonth() + 1),
      day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }

    //数据存储对象
    var news = {
      title: this.title,
      content: this.content,
      pic: this.pic, //图片处理最后来说，现在先乱存
      time: time
    };

    //打开数据连接，打开就是一个回调......
    mongodb.open(function (err, db) {
      //错误就退出
      if (err) {
        return callback(err);
      }

      //打开news集合
      db.collection('news', function (err, collection) {
        if (err) {
          mongodb.close();
          return callback(err);
        }

        //写入集合（写入数据库）
        collection.insert(news, { safe: true }, function (err) {
          return callback(err);
        });
        callback(null);//err为null
      });
    });
  }
};