
var requestAnimationFrame = window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;

var vueApp;
    document.addEventListener('DOMContentLoaded',function(event){
        initializationAll();
        
        document.addEventListener('keydown',function(ev){
            var keycode = ev.keyCode;
            if(keycode == 13){
                if(vueApp){
                    vueApp.doNextAct();
                }
            }
        });
    });
function initializationAll(){
        function getStringNum(num,digit){
            var line = '';
            for(var i=0;i<digit;i++){
                line=String(digNum(num,Math.pow(10,i)))+line;
            }
            return line;
        }
        function digNum(num, digit) {//num = 数値　digit=桁　１，１０、１００
            if (digit % 10 == 0 || digit == 1) {
                return Math.floor(num / digit) % 10
            } else {
                return NaN;
            }
        }
    
        vueApp = new Vue({
            el:'#app',
            data:{
                isLoaded:false,
                isAC:false,//isAndroidChrome
                    isShowCopy:false,
                consoleObj:{
                    timermode:'default',
                    addgametime:{
                        digit1:0,
                        digit2:0,
                        digit3:0
                    },
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
                    arrowsUp:2,
                    sound:'hone.mp3',
                    tournament:{
                        mode:'single',// mix team
                        gametime:20,// 80 120,
                        setnum:5,//4 4
                        arrowsUp:6,//4 4
                        turntime:15,//8 8
                        firstStand:1,
                        shootOff:false  
                    }
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
                    timerMode:'',
                    tournamentMode:'',
                    firstStand:0,
                    arrowsUp:0,
                    orderOfPlay:[],
                    endnum:0
                },
                
                status:{
                    inCount:false,
                    timerStatus:"timeup",
                    gameStatus:"",
                    statusColor:"",
                    stand:0,
                    auxTimer:false,
                    lastPosition:"",
                    gameover:false,
                    time:0//各射射巡進行数
                },
                
                display:{
                    min:0,
                    flipmin:0,
                    mmin:0,
                    end:0,
                    stand:'',
                    
                    remdot1:0,
                    remdot2:0
                },
                toast:{
                    toastMessage:'',
                    timeoutId:0,
                    visibleBelt:false
                },
                onCtrl:false,
                showConfig:false,
                selectSound:false,
                showTimerConfig:false,
                timerCore:{},
                flipclock:{},
                sound:{},
                
                dotmatrixs:{
                    remdot1:{},
                    remdot2:{},
                    endnum:{},
                    lampl:{},
                    lampr:{}
                }
            },
            computed: {
                repbut:function(){
                    if(this.status.time==0){
                        return "disable";
                    }else{
                        return "enable";
                    }
                },
                playbut:function(){
                    if(this.status.gameStatus=="Standby"&&this.status.timerStatus=="timeup")return "play";
                    if(this.status.timerStatus == "counting")return "pause";
                    if(this.status.timerStatus == "pause")return "redume";
                    return "disable"
                },
                nextbut:function(){
                    if(this.status.time==0&&this.status.auxTimer==false)return "disable";
                    
                   if(this.status.auxTimer){
                       if(this.status.gameStatus!="Standby"||
                       this.status.gameStatus!="ArrowsUp"){
                           return "stop";
                       }
                   } if(this.status.gameStatus=="ArrowsUp"||this.status.gameStatus=="Standby"){
                        return "nextend";
                    }else if(this.status.time%this.initGameProperty.arrowsUp != 0){
                        return "forward";
                    }else {
                        return "stop";
                    }
                }
            },
            watch: {
                showConfig:function(val){
                    if(val){
                        this.showTimerConfig = false;
                    }
                },
                showTimerConfig:function(val){
                    if(val){
                        this.showConfig = false;
                    }
                },
                'consoleObj.timermode':function(val){
                        if(!this.isLoaded)return;
                    Vue.nextTick(function () {
                        this.timerCore.rejectGameinfo()
                        this.counterInit();
                    },this);
                },
                'consoleObj.tournament.mode':function(val){
                    switch(val){
                        case "single":
                            this.consoleObj.tournament.gametime=20;
                            this.consoleObj.tournament.setnum=5;
                            this.consoleObj.tournament.arrowsUp=6;
                            this.consoleObj.tournament.turntime = 15
                            break;
                        case "team":
                            this.consoleObj.tournament.gametime=120;
                            this.consoleObj.tournament.setnum=4;
                            this.consoleObj.tournament.arrowsUp=4;
                            this.consoleObj.tournament.turntime=8;
                            break;
                        case "mix":
                            this.consoleObj.tournament.gametime=80;
                            this.consoleObj.tournament.setnum=4;
                            this.consoleObj.tournament.arrowsUp=4;
                            this.consoleObj.tournament.turntime=8;
                            break;   
                    }
                    this.consoleObj.tournament.shootOff=false;
                        if(!this.isLoaded)return;
                        this.timerCore.rejectGameinfo()
                        this.counterInit();
                },
                
                'consoleObj.tournament.shootOff':function(val){
                    if(val){
                        switch(this.consoleObj.tournament.mode){
                            case "single":
                                this.consoleObj.tournament.gametime=20;
                                this.consoleObj.tournament.setnum=1;
                                this.consoleObj.tournament.arrowsUp=2;
                                break;
                            case "team":
                                this.consoleObj.tournament.gametime=60;
                                this.consoleObj.tournament.setnum=1;
                                this.consoleObj.tournament.arrowsUp=6;
                                break;
                            case "mix":
                                this.consoleObj.tournament.gametime=80;
                                this.consoleObj.tournament.setnum=1;
                                this.consoleObj.tournament.arrowsUp=4;
                                break;   
                        }
                    }
                },
                'consoleObj.orderOfPlay':function(val){
                    if(val!=3)return;
                    if(this.consoleObj.endnum.digit1%2!=0)this.consoleObj.endnum.digit1++;
                },
                'display.flipmin':function (val){
                    this.flipclock.setTime(val);
                },
                'toast.toastMessage':function(val){
                    if(this.toast.toastMessage==="")return;
                    this.showToast();
                },
                'status.gameStatus':function(val){
                    switch(val){
                        case "Standby":
                            this.status.statusColor = "shoot";
                            break;
                        case "Ready":
                            this.sound.play("ready");
                            this.status.statusColor = "warn";
                            break;
                        case "Shoot":
                            this.sound.play("start");
                            this.status.statusColor="shoot";
                            break;
                        case "Caution":
                            this.status.statusColor = "caution";
                            break;
                        case "Warn":
                            this.status.statusColor = "warn";
                            break;
                        case "ArrowsUp":
                            this.sound.play("end");
                            this.status.statusColor = "warn";
                            break;
                    }
                },
                'status.timerStatus':function(val){
                    var inShooting = (this.status.gameStatus==="Shoot"||
                                      this.status.gameStatus==="Ready"||
                                     this.status.gameStatus==="Worn"||
                                     this.status.gameStatus==="Caution");
                    if(val === "pause"&&inShooting){
                            this.sound.play("end");
                            this.statusColor ="warn";
                    }
                    if(val === "counting"&&inShooting){
                        this.sound.play("start");
                        reColor.call(this);
                    }
                    function reColor(){
                    switch(this.status.gameStatus){
                        case "Standby":
                            this.status.statusColor = "shoot";
                            break;
                        case "Ready":
                            this.status.statusColor = "warn";
                            break;
                        case "Shoot":
                            this.status.statusColor="shoot";
                            break;
                        case "Caution":
                            this.status.statusColor = "caution";
                            break;
                        case "Warn":
                            this.status.statusColor = "warn";
                            break;
                        case "ArrowsUp":
                            this.status.statusColor = "warn";
                            break;
                    }
                    }
                },
                'display.end':function(val){
                    var digit=this.consoleObj.timermode=='default'?2:1;
                        this.dotmatrixs.endnum.changeValue(getStringNum(val,digit));
                },
                'display.min':function(val){
                    if(this.consoleObj.timermode=="default")return;
                },
                
                'display.remdot1':function(val){
                    if(this.consoleObj.timermode=="default")return;
                    var digit=this.consoleObj.tournament.mode=='team'?3:2;
                    if(this.status.stand>0)
                    this.dotmatrixs['remdot1'].changeValue(getStringNum(val,digit));
                },
                'display.remdot2':function(val){
                    if(this.consoleObj.timermode=="default")return;
                    var digit=this.consoleObj.tournament.mode=='team'?3:2;
                    if(this.status.stand>0) this.dotmatrixs['remdot2'].changeValue(getStringNum(val,digit));
                }
            },
            methods: {
                counterInit:function(){
                    var digit=this.consoleObj.timermode=='default'?2:1;
                    var startnum = (this.consoleObj.timermode=='default')?999:(this.consoleObj.tournament.mode=='team')?999:99;
                    this.flipclock = new FlipClock($('.clock'), startnum, {
                        clockFace: 'Counter'
                    });
                    this.flipclock.setTime(0); 
                        
                        this.dotmatrixs.endnum= new DotMatrix("endnum");
                        this.dotmatrixs.endnum.target.innerHTML="";
                        this.dotmatrixs.endnum.draw({value : getStringNum(0,digit),colorOn : "#ff8b17", colorOff : "#4b2a12",digit:digit});
                    
                    if(this.consoleObj.timermode=="tournament"){
                        this.dotmatrixs.remdot1 = new DotMatrix("remdot1");
                        this.dotmatrixs.remdot2 = new DotMatrix("remdot2");
                        this.dotmatrixs.remdot1.target.innerHTML="";
                        this.dotmatrixs.remdot2.target.innerHTML="";
                        
                        this.dotmatrixs.remdot1.draw({value : "000",colorOn : "#ff8b17", colorOff : "#4b2a12",digit:this.consoleObj.tournament.mode=='team'?3:2});
                        this.dotmatrixs.remdot2.draw({value : "000",colorOn : "#ff8b17", colorOff : "#4b2a12",digit:this.consoleObj.tournament.mode=='team'?3:2});
                        
                        this.dotmatrixs.lampl = new DotMatrix('dotlamp1');
                        this.dotmatrixs.lampr = new DotMatrix('dotlamp2');
                        this.dotmatrixs.lampl.draw({value : " FIRST ",colorOn : "#4b2a12", colorOff : "#ffff00",digit:7,shape : "square"});
                        this.dotmatrixs.lampr.draw({value : " FIRST ",colorOn : "#4b2a12", colorOff : "#ffff00",digit:7,shape : "square"});
                        
                    }
                    
                },
                showCopy:function(b){
                    if(b){
                        $('#splash').show();
                        this.isShowCopy = true;
                    }else{
                        $('#splash').fadeOut(1000);
                        this.isShowCopy = false;
                    }
                },
                setFullScreen:function(){
                    this.isAC = false;
                    enterFullscreen();
                    function enterFullscreen () {
                      var x = document.body;
                      if (x.webkitRequestFullScreen) {
                        x.webkitRequestFullScreen();
                      } else {
                        x.requestFullScreen();
                      }
                    }
                },
                getStrageData:function(callback){
                    var json = localStorage.getItem('timerInitObj')
                    if(json == null)return;
                    var obj = $.parseJSON(json);
                    var io = this.consoleObj;
                    
                    jQuery.extend(true,io,obj);
                    if(callback){
                        callback();
                    }
                },
                setStrageData:function(){
                    var json = JSON.stringify(this.consoleObj);
                    localStorage.setItem('timerInitObj',json);
                },
                setSound:function(s){
                    this.consoleObj.sound=s;
                    this.setHornSound([s]);
                    this.selectSound=false;
                    this.sound.play('start');
                },
                doNextAct:function(){
                    if(this.status.gameStatus == 'Standby' && this.playbut!='disable'){
                        this.playpause();
                    }else if(this.status.gameStatus != 'Standby' && this.nextbut!='disable'){
                        this.nextEnd();
                    }
                },
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
                reset:function(){
                    if(this.status.time==0){
                        return false;
                    }
                    this.setConfig();
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
                    if(this.status.time==0&&this.status.auxTimer==false)return;
                    if(this.status.auxTimer){
                        this.timerCore.stop();
                        return;
                    }
                    if(this.status.time%this.initGameProperty.arrowsUp != 0){
                        //this.timerCore.stop();
                        if(this.status.gameStatus=="Standby"){
                        this.timerCore.setReady();
                        }else{
                        this.timerCore.setReady(true);
                        }
                    }else if(this.status.gameStatus == "ArrowsUp"||this.status.gameStatus=="Standby"){
                        this.timerCore.setReady();
                    }else{
                        this.timerCore.stop();
                    }
                },
                setSpecialTimer:function(){
                    this.showTimerConfig = false;
                    var c=this.consoleObj;
                    var obj={
                        readyTime:0,  gameTime:getNum([c.addgametime.digit1,c.addgametime.digit2,c.addgametime.digit3]),
                        caution:45000,
                        warn:30000,
                    };
                    if(obj.gameTime<10){
                        this.toast.toastMessage="設定値が不正です。<br>10秒以上を設定してください。"
                        return;
                    }
                    obj.caution = obj.gameTime<obj.caution?0:obj.caution;
                    obj.warn = obj.gameTime<obj.warn?0:obj.warn;
                    
                    this.timerCore.setReady(false,obj);
                    this.setStrageData();
                    function getNum(arr){
                        var total=0;
                        for(var i=0;i<arr.length;i++){
                           total += arr[i]*Math.pow(10,i);
                        }
                        return total*1000;
                    }
                },
                setConfig:function(){
                    this.showConfig=false;
                    var c=this.consoleObj;
                    
                    var temp={
                        timerMode:'',
                        gameTime:0,
                        readyTime:0,
                        caution:45000,
                        warn:30000,
                        arrowsUp:0,
                        orderOfPlay:[],
                        endnum:0
                    };
                    
                    if(c.timermode=='default'){
                        temp={
                            timerMode:c.timermode,
                            gameTime:getNum([c.gametime.digit1,c.gametime.digit2,c.gametime.digit3]),
                            readyTime:getNum([c.readytime.digit1,c.readytime.digit2]),
                            caution:45000,
                            warn:30000,
                            arrowsUp:c.arrowsUp,
                            orderOfPlay:getOrder(c.orderOfPlay),
                            endnum:getNum([c.endnum.digit1,c.endnum.digit2])/1000
                        };
                    }
                    
                    if(c.timermode=='tournament'){
                        temp={
                            timerMode:c.timermode,
                            tournamentMode:c.tournament.mode,
                            firstStand:c.tournament.firstStand,
                            gameTime:c.tournament.gametime*1000,
                            readyTime:10*1000,
                            caution:0,
                            warn:0,
                            arrowsUp:c.tournament.arrowsUp,
                            orderOfPlay:['TARGET1','TARGET2'],
                            endnum:c.tournament.turntime,
                            setnum:c.tournament.setnum
                        };
                    }
                    
                    if(temp.gameTime<temp.caution){
                        temp.caution=0;
                        temp.warn=0;
                    }
                    if(temp.gameTime<10){
                        this.toast.toastMessage="設定値が不正です。<br>10秒以上を設定してください。"
                        return;
                    }
                    this.timerCore.setGameinfo(temp);
                    this.setStrageData();
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
                        case 'addgametime':
                            countTime.call(this,bool,key,n);
                            break;
                        case 'gametime':
                            countTime.call(this,bool,key,n);
                            break;
                        case 'readytime':
                            countTime.call(this,bool,key,n);
                            break;
                        case 'endnum':
                            var endnum=this.consoleObj.endnum.digit2*10+this.consoleObj.endnum.digit1;
                            endnum = bool?endnum+1:endnum-1;
                            if(this.consoleObj.orderOfPlay==3){
                                if(bool){
                                endnum = endnum%2!=0?endnum+1:endnum;
                                }else{
                                endnum = endnum%2!=0?endnum-1:endnum;
                                }
                            }
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
                    
                },
                setHornSound:function(urdArray){
                    this.sound=new Howl({
                      src: urdArray,
                      sprite: {
                        ready: [4000, 3000],
                        start: [8500, 2400],
                        end: [0, 4000]
                      }
                    });
                }
                
            },
            mounted:function(){
                var ua = navigator.userAgent.toLowerCase(); 
                if(ua.indexOf('android')>0&&ua.indexOf('chrome')>0)this.isAC=true;
                //this.counterInit();
                var self = this;
                this.getStrageData(function(){
                    self.setHornSound([self.consoleObj.sound]);
                })
                this.timerCore = new TimerCore(this)
                $('#app').show();
                setTimeout(function(){
                    self.counterInit();
                    self.isLoaded=true;
                    $('#splash').fadeOut(1000);
                },6000);
            }
            
        });
    }
function TimerCore(vueIns){
    this.vue = vueIns;
    this.initTimerObj=vueIns.initTimerObj;
    this.initGameProperty=vueIns.initGameProperty;
    this.toast = vueIns.toast;
    this.reset = vueIns.setConfig;
    this.status=vueIns.status;
    this.display = vueIns.display;
    this.counterObj={};
    this.intervalID = 0;
    this.standCounter = [];//3立時エンド計算用
    this.counterIndex = 0;//トーナメント時カウンター参照用
    
    this.countConf = {
        readyTime:0,
        gameTime:0,
        caution:0,
        warn:0,
        time:0
    }
}

TimerCore.prototype.rejectGameinfo = function(){
    clearInterval(this.intervalID);
    this.status.inCount = false;
    this.status.timerStatus = "timeup";
    this.status.auxTimer=false;
    this.status.statusColor = '';
    this.initTimerObj.gameTime = 0;
    this.initTimerObj.readyTime = 0;
    this.status.stand=0;
    this.status.time=0;
    this.display.flipmin=0;
    this.display.min = 0;
    this.display.mmin = 0;
    this.display.stand = '';
    this.display.end = 0;
    this.display.remdot1=0;
    this.display.remdot2=0;
    this.display.stand='';
    this.initGameProperty.arrowsUp=0;
    this.initGameProperty.orderOfPlay=[];
}

TimerCore.prototype.setGameinfo = function(obj){
    this.initTimerObj.gameTime = obj.gameTime;
    this.initTimerObj.readyTime = obj.readyTime;
    this.initTimerObj.sign.caution = obj.caution;
    this.initTimerObj.sign.warn = obj.warn;
    this.initGameProperty.timerMode = obj.timerMode;
    this.initGameProperty.tournamentMode = obj.tournamentMode||'';
    this.initGameProperty.firstStand = obj.firstStand||0;
    this.initGameProperty.arrowsUp = obj.arrowsUp;
    this.initGameProperty.orderOfPlay = obj.orderOfPlay;
    this.initGameProperty.endnum = obj.endnum;
    this.initGameProperty.setnum = obj.setnum||0;
    this.status.stand=0;
    this.status.time=0;
    this.display.min = 0;
    this.display.mmin = 0;
    this.display.stand = '';
    this.display.end = 0;
    
    this.status.gameover=false;
    
    this.standCounter = new Array(this.initGameProperty.orderOfPlay.length);
    for(var i=0;i<this.standCounter.length;i++){
        this.standCounter[i]=0;
    }
    
    this.setReady();
}
//射前設定
TimerCore.prototype.setReady = function(bool,obj){//timer設定obj,bool一時停止状態で起動するか
    var self = this;
    if(typeof obj === "object"){//直タイマー
        if(this.status.inCount)return;
        this.status.auxTimer = true;
        this.countConf.readyTime = obj.readyTime;
        this.countConf.gameTime = obj.gameTime;
        this.countConf.caution = obj.caution;
        this.countConf.warn = obj.warn;
        this.display.stand="Special";
        this.status.lastPosition = this.status.gameStatus;
        this.status.gameStatus = "Standby";
    }else{//通常時
        if(this.isFinished()){
            return false;
        }
        this.status.gameStatus = "Standby";
        this.status.auxTimer = false;
        this.countConf.readyTime = this.initTimerObj.readyTime;
        this.countConf.gameTime = this.initTimerObj.gameTime;
        this.countConf.caution = this.initTimerObj.sign.caution;
        this.countConf.warn = this.initTimerObj.sign.warn;
        
        this.status.time++;
        
       
        if(this.initGameProperty.timerMode == 'default'){
        //立ち位置表示
            if(this.initGameProperty.orderOfPlay.length==3||this.status.time==1||this.status.time%this.initGameProperty.arrowsUp != 1){
                this.status.stand++;
                if(this.status.stand > this.initGameProperty.orderOfPlay.length){
                    this.status.stand=1;
                }
            }
            //end進み
          //playorderが１か２立
            if((this.initGameProperty.orderOfPlay.length==2&&this.status.time%this.initGameProperty.orderOfPlay.length == 1)||this.initGameProperty.orderOfPlay.length==1){
                this.display.end++
            }
            //3立
            if(this.initGameProperty.orderOfPlay.length==3){
                this.standCounter[this.status.stand-1]++;
                this.display.end=this.standCounter[this.status.stand-1];
            }
        }else if(this.initGameProperty.timerMode == 'tournament'){
        //立ち位置表示
            if(this.status.time==1){
                this.status.stand=this.initGameProperty.firstStand;
            }else{
                this.status.stand++;
                if(this.status.stand > this.initGameProperty.orderOfPlay.length){
                    this.status.stand=1;
                }
            }
            //end転じてset進み
            if(this.status.time%this.initGameProperty.arrowsUp==1){//初回ないしやとりばさみ
                this.display.end++;
            }
        }
        this.display.stand = this.initGameProperty.orderOfPlay[this.status.stand-1];
    }
    
    clearInterval(self.intervalID);
    if(this.initGameProperty.timerMode == 'tournament' && this.initGameProperty.tournamentMode!='single'){//トーナメント　チームミクス時カウンター保持
            if(this.status.time%this.initGameProperty.arrowsUp==1){
                this.counterObj = new DateCount();
                this.display.flipmin = this.countConf.gameTime/1000;
            }else{
                this.display.flipmin = this.counterObj.getElapsedTime(this.counterIndex)/1000;
            }
    }else{//defaultないしトーナメントシングル
        this.counterObj = new DateCount();
        this.display.flipmin = this.countConf.gameTime/1000;
    }
    this.display.min = this.display.flipmin;
    this.status.timerStatus = "timeup";
    
    if(bool){
        this.countDo();
    }else{
        this.toast.toastMessage = "STANDBY!!"
    }
}

TimerCore.prototype.countDo = function(){
    this.counterIndex = 0;
    if(this.initGameProperty.timerMode == 'tournament'){
        this.counterIndex = this.status.stand-1;
    }
    this.counterObj.start(this.counterIndex);
    this.status.inCount = true;
    this.status.timerStatus = "counting"
    var self = this;
    this.intervalID=setInterval(function(){//1000分の5秒単位でタイマー状態確認
        var count = self.counterObj.getElapsedTime(self.counterIndex);
        var ingameTime = 0;
        var fliplag = 0;
        
        if(self.countConf.readyTime>count){
            self.status.gameStatus = "Ready";
            ingameTime = self.countConf.readyTime-count;
        }else{
            ingameTime = self.countConf.gameTime-(count-self.countConf.readyTime);
            if(self.countConf.readyTime + (self.countConf.gameTime-(self.countConf.caution>0?self.countConf.caution:self.countConf.warn)) > count){
                self.status.gameStatus = "Shoot";
            }else if(self.countConf.readyTime + (self.countConf.gameTime-self.countConf.warn) > count){
                self.status.gameStatus = "Caution";
            }else if(self.countConf.readyTime + self.countConf.gameTime > count){
                self.status.gameStatus = "Warn";
            }else if(self.countConf.readyTime + self.countConf.gameTime <= count){
                if(!self.status.auxTimer && self.status.time % self.initGameProperty.arrowsUp != 0){
                    self.setReady(true);
                    return;
                }
                self.stop();
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
    },5);
}
TimerCore.prototype.stop = function(){
    clearInterval(this.intervalID);
    this.status.inCount = false;
    this.status.timerStatus = "timeup"
    if(this.status.auxTimer){
        this.status.auxTimer = false;
        if(this.status.lastPosition != "ArrowsUp"){
            this.vue.sound.play('end');
            this.countConf.readyTime = this.initTimerObj.readyTime;
            this.countConf.gameTime = this.initTimerObj.gameTime;
            this.countConf.caution = this.initTimerObj.sign.caution;
            this.countConf.warn = this.initTimerObj.sign.warn;
            this.display.flipmin = this.countConf.gameTime/1000;
        }else{
    this.display.flipmin=0;
        }
        this.status.gameStatus = this.status.lastPosition;
    }else{
        
        if(this.isFinished()){
            //round finish
                this.toast.toastMessage = "Game is over!";
            this.status.gameStatus = '';
            this.vue.sound.play('end');
        }else{
            // end
            this.toast.toastMessage = "Cease Fire!"
            this.status.gameStatus = "ArrowsUp";
        }
    this.display.flipmin=0;
    }
    this.display.mmin=0;
    this.display.min=0;
}
TimerCore.prototype.isFinished = function(time){
    if(this.initGameProperty.endnum==0)return false;
    var times;
    if(time){
        times = time;
    }else{
        times = this.status.time;
    }
    var ret = (this.display.end==this.initGameProperty.endnum)&&(times == this.initGameProperty.orderOfPlay.length*this.initGameProperty.endnum);
        
    this.status.gameover = ret;
    return ret;
}
TimerCore.prototype.pause = function(){
    this.status.timerStatus = "pause";
    this.counterObj.pause(this.counterIndex);
}
TimerCore.prototype.redume = function(){
    this.status.timerStatus = "counting";
    this.counterObj.redume(this.counterIndex);
}

function DateCount(){
    this.startDate = [0,0];
    this.pauseTime = [0,0];
    this.redumeTime = [0,0];
    this.elapsedTime = [0,0];
}


DateCount.prototype.start = function(n){
    var index = 0;
    if(n)index = n;
    this.startDate[index] = Date.now();
}
DateCount.prototype.getElapsedTime = function(n){
    var index = 0;
    if(n)index = n;
    var nowDate = Date.now();
    if(this.pauseTime[index]>0){
        this.redumeTime[index] += nowDate-this.pauseTime[index];
        this.pauseTime[index] = nowDate;
    }
    this.elapsedTime[index] = nowDate-this.startDate[index]-this.redumeTime[index];
    return this.elapsedTime[index];
}
DateCount.prototype.pause = function(n){
    var index = 0;
    if(n)index = n;
    this.pauseTime[index] = Date.now();
}
DateCount.prototype.redume = function(n){
    var index = 0;
    if(n)index = n;
    var nowDate = Date.now();
    this.redumeTime[index] += this.pauseTime[index]==0?0:nowDate-this.pauseTime[index];
    this.pauseTime[index] = 0;
}

