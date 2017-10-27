'use strict'
var body=document.getElementsByTagName('body')[0]
var $canvas = $('#game');
var canvas = $canvas.get(0);
var context=canvas.getContext('2d')
canvas.width=window.innerWidth
canvas.height=window.innerHeight
var canvasWidth = canvas.clientWidth;
var canvasHeight = canvas.clientHeight;
var myimg='bluePlaneIcon'
var Score=document.createElement('div')
Score.className='Score'

//four div
var uiIndex=document.getElementById('ui-index')
var uiSetting=document.getElementsByClassName('ui-setting')[0]
var uiRule=document.getElementsByClassName('ui-rule')[0]
var gameover=document.getElementsByClassName('gameover')[0]
//button
var gameStart=uiIndex.getElementsByClassName('btn')[0]
var gameSetting=uiIndex.getElementsByClassName('btn')[1]
var gameRule=uiIndex.getElementsByClassName('btn')[2]
var settingbtn=uiSetting.getElementsByClassName('btn')[0]
var rulebtn=uiRule.getElementsByClassName('btn')[0]
var restart=gameover.getElementsByClassName('btn')[0]
var back=gameover.getElementsByClassName('btn')[1]
//setting
var musicSetting=uiSetting.getElementsByTagName('select')[0]
var backgruondSetting=uiSetting.getElementsByTagName('select')[1]
var aircraftSetting=uiSetting.getElementsByTagName('select')[2]

//
window.requestAnimFrame=
window.requestAnimationFrame||
window.webkitRequestAnimationFrame||
window.mozRequestAnimationFrame||
window.oRequestAnimationFrame||
window.msRequestAnimationFrame||
function (callback){
  window.setTimeout(callback,1000/30)
}
//设置背景
function setting(){
    switch (backgruondSetting.value)
    {
    case '1':
    body.style.backgroundImage='url(img/bg_1.jpg)';
    break;
    case '2':
    body.style.backgroundImage='url(img/bg_2.jpg)';
    break;
    case '3':
    body.style.backgroundImage='url(img/bg_3.jpg)';
    break;
    case '4':
    body.style.backgroundImage='url(img/bg_4.jpg)';
    break;
    }
    switch(aircraftSetting.value)
    {
      case 'bluePlaneIcon':
      myimg='bluePlaneIcon'
      break;
      case 'pinkPlaneIcon':
      myimg='pinkPlaneIcon'
      break;
    }
}

//按钮
gameStart.onclick=()=>{
    uiIndex.style.display="none"
    GAME.start()
    // do sth
}
gameSetting.onclick=()=>{
    uiIndex.style.display="none"
    uiSetting.style.display="flex"    
}
gameRule.onclick=()=>{
    uiIndex.style.display="none"
    uiRule.style.display="flex"
}
settingbtn.onclick=()=>{
    uiIndex.style.display="flex"
    uiSetting.style.display="none"
    setting ()
}
rulebtn.onclick=()=>{
    uiIndex.style.display="flex"
    uiRule.style.display="none"
}
restart.onclick=()=>{
  gameover.style.display="none"
  body.removeChild(Score)
  GAME.start()
}
back.onclick=()=>{
  gameover.style.display='none'
  uiIndex.style.display="flex"
  body.removeChild(Score)

}




var GAME = {
  /**
   * 游戏初始化
   */
  score:0,
  init: function(opts) {
    // 设置opts
    var opts = Object.assign({}, opts, CONFIG);
    this.opts = opts;
    
    // 计算飞机初始坐标
    this.planePosX = canvasWidth / 2 - opts.planeSize.width / 2;
    this.planePosY = canvasHeight - opts.planeSize.height - 50;
    
    // console.log(this.opts);
  },
  /**
   * 游戏开始需要设置
   */
  start: function () {
    // 获取游戏初始化 level
    var self = this; // 保存函数调用对象（即Game）
    var opts = this.opts;
    var images = this.images;
    // 清空射击目标对象数组和分数设置为 0
    this.enemies = []; 
    this.score = 0;
    Score.innerHTML='Score:'+this.score
    body.appendChild(Score)

    // 随机生成大小敌机
    this.createSmallEnemyInterval = setInterval(function () {
      self.createEnemy('normal');
    }, 500);
    this.createBigEnemyInterval = setInterval(function () {
      self.createEnemy('big');
    }, 1500);

    // 创建主角英雄
    this.plane = new Plane({
      x: this.planePosX,
      y: this.planePosY,
      width: opts.planeSize.width,
      height: opts.planeSize.height,
      // 子弹尺寸速度
      bulletSize: opts.bulletSize, 
      bulletSpeed: opts.bulletSpeed, 
      // 图标相关
      icon: resourceHelper.getImage(myimg),
      bulletIcon: resourceHelper.getImage('fireIcon'),
      boomIcon: resourceHelper.getImage('enemyBigBoomIcon')
    });
    // 飞机开始射击
    this.plane.startShoot();

    
    // 开始更新游戏
    this.update();
  },
  update: function () {
    var self = this;
    var opts = this.opts;
    // 更新飞机、敌人
    this.updateElement();

    // 先清理画布
    context.clearRect(0, 0, canvasWidth, canvasHeight);
 
    if (this.plane.status === 'boomed') {
      this.end();
      return;
    }

    // 绘制画布
    this.draw();
    
    // 不断循环 update
    requestAnimFrame(function() {
      self.update()
    });
  },
 
  /**
   * 更新当前所有元素的状态
   */
  updateElement: function() {
    var opts = this.opts;
    var enemySize = opts.enemySize;
    var enemies = this.enemies;
    var plane = this.plane;
    var i = enemies.length;
    
    if (plane.status === 'booming') {
      plane.booming();
      return;
    }


    // 循环更新敌人
    while (i--) {
      var enemy = enemies[i];
      enemy.down();

      if (enemy.y >= canvasHeight) {
        this.enemies.splice(i, 1);
      } else {
        // 判断飞机状态
        if (plane.status === 'normal') {
          if (plane.hasCrash(enemy)) {
            plane.booming();
          }
        }
        // 根据怪兽状态判断是否被击中
        switch(enemy.status) {
          case 'normal':
            if (plane.hasHit(enemy)) {
              enemy.live -= 1;
              if (enemy.live === 0) {
                enemy.booming();
                GAME.score+=enemy.getScore
                // console.log(this.score)
                Score.innerHTML='Score:'+this.score
              }
            }
            break;
          case 'booming':
            enemy.booming();
            break;
          case 'boomed':
            enemies.splice(i, 1);
            break;
        }
      }
    }
  },
  /**
   * 绑定手指触摸
   */
  bindTouchAction: function () {
    var opts = this.opts;
    var self = this;
    // 飞机极限横坐标、纵坐标
    var planeMinX = 0;
    var planeMinY = 0;
    var planeMaxX = canvasWidth - opts.planeSize.width;
    var planeMaxY = canvasHeight - opts.planeSize.height;
    // 手指初始位置坐标
    var startTouchX;
    var startTouchY;
    // 飞机初始位置
    var startPlaneX;
    var startPlaneY;
  
    // 首次触屏
    $canvas.on('touchstart', function (e) {
      var plane = self.plane;
      // 记录首次触摸位置
      startTouchX = e.touches[0].clientX;
      startTouchY = e.touches[0].clientY;
      // console.log('touchstart', startTouchX, startTouchY);
      // 记录飞机的初始位置
      startPlaneX = plane.x;
      startPlaneY = plane.y;
  
    });
    // 滑动屏幕
    $canvas.on('touchmove', function (e) {
      var newTouchX = e.touches[0].clientX;
      var newTouchY = e.touches[0].clientY;
      // console.log('touchmove', newTouchX, newTouchY);
      
      // 新的飞机坐标等于手指滑动的距离加上飞机初始位置
      var newPlaneX = startPlaneX + newTouchX - startTouchX;
      var newPlaneY = startPlaneY + newTouchY - startTouchY;
      // 判断是否超出位置
      if(newPlaneX < planeMinX){
        newPlaneX = planeMinX;
      }
      if(newPlaneX > planeMaxX){
        newPlaneX = planeMaxX;
      }
      if(newPlaneY < planeMinY){
        newPlaneY = planeMinY;
      }
      if(newPlaneY > planeMaxY){
        newPlaneY = planeMaxY;
      }
      // 更新飞机的位置
      self.plane.setPosition(newPlaneX, newPlaneY);
      // 禁止默认事件，防止滚动屏幕
      e.preventDefault();
    });
  },

  /**
   * 生成怪兽
   */
  createEnemy: function(enemyType) {
    var enemies = this.enemies;
    var opts = this.opts;
    var images = this.images || {};
    var enemySize = opts.enemySmallSize;
    var enemySpeed = opts.enemySpeed;
    var enemyIcon = resourceHelper.getImage('enemySmallIcon');
    var enemyBoomIcon = resourceHelper.getImage('enemySmallBoomIcon');
    var enemyLive = 1; 
    var getscore=100
  
    // 大型敌机参数
    if (enemyType === 'big') {
      enemySize = opts.enemyBigSize;
      enemyIcon = resourceHelper.getImage('enemyBigIcon');
      enemyBoomIcon = resourceHelper.getImage('enemyBigBoomIcon');
      enemySpeed = opts.enemySpeed * 0.6;
      enemyLive = 10;
      getscore=1000
      
    } 
  
    // 综合元素的参数
    var initOpt = {
      x: Math.floor(Math.random() * (canvasWidth - enemySize.width)), 
      y: -enemySize.height,
      enemyType: enemyType,
      live: enemyLive,
      width: enemySize.width,
      height: enemySize.height,
      speed: enemySpeed,
      icon: enemyIcon,
      boomIcon: enemyBoomIcon,
      score:getscore

    }
  
    // 怪兽的数量不大于最大值则新增
    if (enemies.length < opts.enemyMaxNum) {
      enemies.push(new Enemy(initOpt));
    }
  
    // console.log(enemies);
  },
  end: function() {
    setTimeout(function() {gameover.style.display='flex'
    }, 30);
    
  },
  draw: function() {
    this.enemies.forEach(function(enemy) {
      enemy.draw();
    });
    this.plane.draw();
  }
};

/**
 * 页面主入口
 */
function init() {
  // 加载图片资源，加载完成才能交互
  resourceHelper.load(CONFIG.resources, function(resources) {
    // 加载完成
    GAME.init();
    // 绑定手指事件
    GAME.bindTouchAction();

  });
  
}

init();