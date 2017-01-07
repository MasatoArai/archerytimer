
var requestAnimationFrame = window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;

var vueApp;
    document.addEventListener('DOMContentLoaded',function(event){
        initializationAll();
    });
function initializationAll(){
        vueApp = new Vue({
            el:'#container',
            data:{
                consoleObj:{
                    gametime:[0,0,0],
                    readytime:[0,0],
                    endnum:[0,0]
                },
                
                initTimerObj:{
                    gameTime:0,
                    readyTime:0,
                    sign:{
                        caution:0,
                        warn:0
                    }
                },
                
                initGameProperty:{
                    arrowsUp:0,
                    orderOfPlay:[]
                },
                
                status:{
                    inCount:false,
                    gameStatus:"",
                    stand:0,
                    auxTimer:false,
                    time:0,
                    visibleBelt:false
                },
                display:{
                    min:0,
                    flipmin:0,
                    mmin:0,
                    end:1,
                    stand:''
                },
                onCtrl:false,
                showConfig:false,
                timerCore:{},
                flipclock:{},
                sound:{}
            },
            watch: {
                'display.flipmin':function (val){
                    this.flipclock.setTime(val);
                }
            },
            methods: {
                incredecre:function(bool,key,n){
                    switch(key){
                        case 'gametime':
                            countTime.call(this,bool,key,n);
                            break;
                        case 'readytime':
                            countTime.call(this,bool,key,n);
                            break;
                        case 'endnum':
                            var endnum=this.consoleObj.endnum[1]*10+this.consoleObj.endnum[0];
                            endnum = bool?endnum+1:endnum-1;
                            endnum = (endnum<0)?0:endnum;
                            endnum = (endnum>99)?99:endnum;
                            this.consoleObj.endnum[0]=endnum%10;
                            this.consoleObj.endnum[1]=Math.floor(endnum/10);
                            break;
                    }
                    function countTime(bool,key,n){
                        if(bool){//incre
                            this.consoleObj[key][n-1]++;
                            if(this.consoleObj[key][n-1]>9)this.consoleObj[key][n-1]=9;
                        }else{
                            this.consoleObj[key][n-1]--;
                            if(this.consoleObj[key][n-1]>9)this.consoleObj[key][n-1]=0;
                        }
                    }
                    
                }
                
            },
            mounted:function(){
                this.flipclock = new FlipClock($('.clock'), 999, {
                    clockFace: 'Counter'
                });
                this.sound=new Howl({
                  src: ["hone.mp3"],
                  sprite: {
                    ready: [4000, 3000],
                    start: [8000, 2400],
                    end: [0, 4000]
                  }
                });
                this.timerCore = new TimerCore(this)
            }
            
        });
    }
function TimerCore(vueIns){
    this.initTimerObj=vueIns.initTimerObj;
    this.initGameProperty=vueIns.initGameProperty;
    this.status=vueIns.status;
    this.display = vueIns.display;
    this.counterObj={};
    this.intervalID = 0;
    
    this.countConf = {
        readyTime:0,
        gameTime:0,
        caution:0,
        warn:0,
        time:0
    }
}

TimerCore.prototype.setGameinfo = function(obj){
    /*
    gameTime:
    readyTime:
    caution:
    warn:
    arrowsUp:
    orderOfPlay
    */
    this.initTimerObj.gameTime = obj.gameTime;
    this.initTimerObj.readyTime = obj.readyTime;
    this.initTimerObj.sign.caution = obj.caution;
    this.initTimerObj.sign.warn = obj.warn;
    this.initGameProperty.arrowsUp = obj.arrowsUp;
    this.initGameProperty.orderOfPlay = obj.orderOfPlay;
    this.status.stand=0;
    this.status.time=0;
    this.display.min = 0;
    this.display.flipmin = obj.gameTime/1000;
    this.display.mmin = 0;
    this.display.stand = '';
    this.display.end = 0;
}

TimerCore.prototype.setReady = function(bool,obj){//timer設定obj,bool一時停止状態で起動するか
    var self = this;
    clearInterval(self.intervalID);
    this.counterObj = new DateCount();
    this.status.gameStatus = "Standby";
    if(typeof obj === "object"){//直タイマー
        this.status.auxTimer = true;
        this.countConf.readyTime = obj.readyTime;
        this.countConf.gameTime = obj.gameTime;
        this.countConf.caution = obj.caution;
        this.countConf.warn = obj.warn;
        this.display.stand="Special";
    }else{//通常時
        this.status.auxTimer = false;
        this.countConf.readyTime = this.initTimerObj.readyTime;
        this.countConf.gameTime = this.initTimerObj.gameTime;
        this.countConf.caution = this.initTimerObj.sign.caution;
        this.countConf.warn = this.initTimerObj.sign.warn;
        
        this.status.time++;
        if(this.status.time%this.initGameProperty.orderOfPlay.length == 1){
            this.display.end++
        }
        //立ち位置
        if(this.status.time==1||this.status.time%this.initGameProperty.arrowsUp != 1){
            this.status.stand++;
            if(this.status.stand > this.initGameProperty.orderOfPlay.length){
                this.status.stand=1;
            }
        }
        
        this.display.stand = this.initGameProperty.orderOfPlay[this.status.stand-1];
    }
    if(bool){
        this.countDo();
    }
}

TimerCore.prototype.countDo = function(){
    this.counterObj.start();
    this.status.inCount = true;
    var self = this;
    this.intervalID=setInterval(function(){
        var count = self.counterObj.getElapsedTime();
        var ingameTime = 0;
        var fliplag = 0;
        
        if(self.countConf.readyTime>count){
            self.status.gameStatus = "Ready";
            ingameTime = self.countConf.readyTime-count;
        }else{
            ingameTime = self.countConf.gameTime-(count-self.countConf.readyTime);
            if(self.countConf.readyTime + (self.countConf.gameTime-self.countConf.caution) > count){
                self.status.gameStatus = "Shoot";
            }else if(self.countConf.readyTime + (self.countConf.gameTime-self.countConf.warn) > count){
                self.status.gameStatus = "Caution";
            }else if(self.countConf.readyTime + self.countConf.gameTime > count){
                self.status.gameStatus = "Warn";
            }else if(self.countConf.readyTime + self.countConf.gameTime <= count){
                clearInterval(self.intervalID);
                this.status.inCount = false;
                if(self.status.time%self.initGameProperty.arrowsUp != 0){
                    self.setReady(true);
                    return;
                }
                self.status.gameStatus = "ArrowsUp";
            }
        }
        if(self.countConf.readyTime>count+600){
            fliplag = self.countConf.readyTime-(count+600);
        }else{
            fliplag = self.countConf.gameTime-(count+600-self.countConf.readyTime);
        }
        var min = ingameTime/1000;
        var flipmin = fliplag/1000;
        var dispMin = 0;
        
            dispMin = Math.ceil(min);
            flipmin = Math.ceil(flipmin);
        /*
        if(self.status.gameStatus == "Ready"){
            dispMin=Math.ceil(min);
        }else{
            dispMin=Math.floor(min);
        }*/
        if(self.display.flipmin!=flipmin){
            self.display.flipmin=flipmin;
        }
        if(self.display.min!=dispMin){
            if(dispMin==0){
                self.display.mmin = 0;
            }else{
                self.display.mmin = 99;
            }
            self.display.min = dispMin;
        }else{
            self.display.mmin = Math.round((min%1)*100);
        }
    },10);
}
TimerCore.prototype.pause = function(){
    this.counterObj.pause();
}
TimerCore.prototype.redume = function(){
    this.counterObj.redume();
}

function DateCount(){
    this.startDate = 0;
    this.pauseTime = 0;
    this.redumeTime = 0;
    this.elapsedTime = 0;
}
DateCount.prototype.start = function(){
    this.startDate = Date.now();
}
DateCount.prototype.getElapsedTime = function(){
    var nowDate = Date.now();
    if(this.pauseTime>0){
        this.redumeTime += nowDate-this.pauseTime;
        this.pauseTime = nowDate;
    }
    this.elapsedTime = nowDate-this.startDate-this.redumeTime;
    return this.elapsedTime;
}
DateCount.prototype.pause = function(){
    this.pauseTime = Date.now();
}
DateCount.prototype.redume = function(){
    var nowDate = Date.now();
    this.radumeTime += this.pauseTime==0?0:nowDate-this.pauseTime;
    this.pauseTime = 0;
}

