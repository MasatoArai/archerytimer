
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
                    gametime:{
                        digit1:0,
                        digit2:0,
                        digit3:0
                    },
                    readytime:{
                        digit1:0,
                        digit2:0
                    },
                    endnum:{
                        digit1:0,
                        digit2:0
                    },
                    orderOfPlay:2,
                    arrowsUp:2
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
                    orderOfPlay:[],
                    endnum:0
                },
                
                status:{
                    inCount:false,
                    inReady:false,
                    timerStatus:"timeup",
                    gameStatus:"",
                    stand:0,
                    auxTimer:false,
                    time:0
                },
                
                display:{
                    min:0,
                    flipmin:0,
                    mmin:0,
                    end:0,
                    stand:''
                },
                toast:{
                    toastMessage:'',
                    timeoutId:0,
                    visibleBelt:false
                },
                onCtrl:false,
                showConfig:false,
                timerCore:{},
                flipclock:{},
                sound:{}
            },
            computed: {
                playbut:function(){
                    if(this.status.gameStatus=="Standby"&&this.status.timerStatus=="timeup")return "play";
                    if(this.status.timerStatus == "counting")return "pause";
                    if(this.status.timerStatus == "pause")return "redume";
                    return "disable"
                }
            },
            watch: {
                'display.flipmin':function (val){
                    this.flipclock.setTime(val);
                },
                'toast.toastMessage':function(val){
                    if(this.toast.toastMessage==="")return;
                    this.showToast();
                }
            },
            methods: {
                showToast:function(ss){
                    clearTimeout(this.toast.timeoutId);
                    var ct = 3000;
                    if(typeof ss === 'number')ct = ss;
                    this.toast.visibleBelt = true;
                    var self = this;
                    this.toast.timeoutId = setTimeout(function(){
                        self.toast.visibleBelt = false;
                        self.toast.toastMessage='';
                    },ct);
                },
                playpause:function(){
                    if(this.playbut == "play"){
                        this.timerCore.countDo();
                        return;
                    }
                    if(this.playbut == "pause"){
                        this.timerCore.pause();
                        return;
                    }
                    if(this.playbut == "redume"){
                        this.timerCore.redume();
                        return;
                    }
                },
                nextEnd:function(){
                    if(!this.status.inReady)return;
                    this.timerCore.setReady();
                },
                backEnd:function(){
                    if(!this.status.inReady)return;
                },
                setSpecialTimer:function(obj){
                    this.timerCore.setready(false,obj)
                },
                setConfig:function(){
                    this.showConfig=false;
                    var c=this.consoleObj;
                    var temp={
                        gameTime:getNum([c.gametime.digit1,c.gametime.digit2,c.gametime.digit3]),
                        readyTime:getNum([c.readytime.digit1,c.readytime.digit2]),
                        caution:45000,
                        warn:30000,
                        arrowsUp:c.arrowsUp,
                        orderOfPlay:getOrder(c.orderOfPlay),
                        endnum:getNum([c.endnum.digit1,c.endnum.digit2])
                    };
                    if(temp.gameTime<temp.caution){
                        temp.caution=0;
                        temp.warn=0;
                    }
                    if(temp.gameTime<10){
                        this.toast.toastMessage="設定値が不正です。<br>10秒以上を設定してください。"
                        return;
                    }
                    this.timerCore.setGameinfo(temp);
                    function getOrder(n){
                        var ret=[];
                        switch(n){
                            case 1:
                                ret=[""];
                                break;
                            case 2:
                                ret=["AB","CD"];
                                break;
                            case 3:
                                ret=["AB","CD","EF"];
                                break;
                        }
                        return ret;
                    }
                    function getNum(arr){
                        var total=0;
                        for(var i=0;i<arr.length;i++){
                           total += arr[i]*Math.pow(10,i);
                        }
                        return total*1000;
                    }
                },
                incredecre:function(bool,key,n){
                    switch(key){
                        case 'gametime':
                            countTime.call(this,bool,key,n);
                            break;
                        case 'readytime':
                            countTime.call(this,bool,key,n);
                            break;
                        case 'endnum':
                            var endnum=this.consoleObj.endnum.digit2*10+this.consoleObj.endnum.digit1;
                            endnum = bool?endnum+1:endnum-1;
                            endnum = (endnum<0)?0:endnum;
                            endnum = (endnum>99)?99:endnum;
                            this.consoleObj.endnum.digit1=endnum%10;
                            this.consoleObj.endnum.digit2=Math.floor(endnum/10);
                            break;
                    }
                    function countTime(bool,key,n){
                        if(bool){//incre
                            this.consoleObj[key]['digit'+n]++;
                            if(this.consoleObj[key]['digit'+n]>9)this.consoleObj[key]['digit'+n]=9;
                        }else{
                            this.consoleObj[key]['digit'+n]--;
                            if(this.consoleObj[key]['digit'+n]<0)this.consoleObj[key]['digit'+n]=0;
                        }
                    }
                    
                }
                
            },
            mounted:function(){
                this.flipclock = new FlipClock($('.clock'), 999, {
                    clockFace: 'Counter'
                });
                this.flipclock.setTime(0);
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
    this.initTimerObj.gameTime = obj.gameTime;
    this.initTimerObj.readyTime = obj.readyTime;
    this.initTimerObj.sign.caution = obj.caution;
    this.initTimerObj.sign.warn = obj.warn;
    this.initGameProperty.arrowsUp = obj.arrowsUp;
    this.initGameProperty.orderOfPlay = obj.orderOfPlay;
    this.initGameProperty.endnum = obj.endnum;
    this.status.stand=0;
    this.status.time=0;
    this.display.min = 0;
    this.display.flipmin = obj.gameTime/1000;
    this.display.mmin = 0;
    this.display.stand = '';
    this.display.end = 0;
    
    this.setReady();
}

TimerCore.prototype.setReady = function(bool,obj){//timer設定obj,bool一時停止状態で起動するか
    var self = this;
    clearInterval(self.intervalID);
    this.counterObj = new DateCount();
    this.status.gameStatus = "Standby";
    this.status.timerStatus = "timeup";
    this.status.inReady=true;
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
    this.status.timerStatus = "counting"
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
                self.status.timerStatus = "timeup"
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
    this.status.timerStatus = "pause";
    this.counterObj.pause();
}
TimerCore.prototype.redume = function(){
    this.status.timerStatus = "counting";
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

