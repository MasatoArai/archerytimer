var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;
var util;
var vueApp;
document.addEventListener('DOMContentLoaded', function (event) {
    initializationAll();
    document.addEventListener('keydown', function (ev) {
        var keycode = ev.keyCode;
        if (keycode == 13) {
            if (vueApp) {
                vueApp.doNextAct();
            }
        }
    });
});

function Util() {
    this.ver = '0.1';
}
Util.prototype.getStringNum = function (num, digit) {
    var line = '';
    for (var i = 0; i < digit; i++) {
        line = String(digNum(num, Math.pow(10, i))) + line;
    }
    return line;

    function digNum(num, digit) { //num = 数値　digit=桁　１，１０、１００
        if (digit % 10 == 0 || digit == 1) {
            return Math.floor(num / digit) % 10
        }
        else {
            return NaN;
        }
    }
}

function initializationAll() {
    util = new Util();
    vueApp = new Vue({
        el: '#app'
        , data: {
            isLoaded: false
            , isAC: false, //isAndroidChrome
            isShowCopy: false
            , consoleObj: {
                timermode: 'default'
                ,canBGchange:false
                , addgametime: {
                    digit1: 0
                    , digit2: 0
                    , digit3: 0
                }
                , gametime: {
                    digit1: 0
                    , digit2: 0
                    , digit3: 0
                }
                , readytime: {
                    digit1: 0
                    , digit2: 0
                }
                , endnum: {
                    digit1: 0
                    , digit2: 0
                }
                , orderOfPlay: 2
                , arrowsUp: 2
                , sound: 'hone.mp3'
                , tournament: {
                    mode: 'single', // mixed team
                    gametime: 20, // 80 120,
                    setnum: 5, //4 4
                    arrowsUp: 6, //4 4
                    firstStand: 1
                    , shootOff: false
                }
            }
            , initTimerObj: {
                gameTime: 0
                , readyTime: 0
                , sign: {
                    caution: 0
                    , warn: 0
                }
            }
            , initGameProperty: {
                timerMode: ''
                , tournamentMode: ''
                , firstStand: 0
                , arrowsUp: 0
                , orderOfPlay: []
                , endnum: 0
            }
            , status: {
                inCount: false
                , timerStatus: "timeup"
                , gameStatus: ""
                , statusColor: ""
                , stand: 0
                , auxTimer: false
                , lastPosition: "", //タイマー時前回状態復帰用
                gameover: false
                , time: 0 //各射射巡進行数
            }
            , display: {
                min: 0
                , flipmin: 0
                , mmin: 0
                , end: 0
                , stand: ''
                , remdot1: 0
                , remdot2: 0
            }
            , toast: {
                toastMessage: ''
                , timeoutId: 0
                , visibleBelt: false
            }
            , onCtrl: false
            , showConfig: false
            , selectSound: false
            , showTimerConfig: false
            , showKeyinfo: false
            , timerCore: {}
            , flipclock: {}
            , sound: {}
            , dotmatrixs: {
                remdot1: {}
                , remdot2: {}
                , endnum: {}
                , lampl: {}
                , lampr: {}
                , dropdown: {}
                , defaultLampLine1:{}
                , defaultLampLine2:{}
                , standdot:{}
                , dotstatus:{}
            }
            , doubleLineDotmatrixs:{}
        }
        , computed: {
            repbut: function () {
                if (this.status.time == 0) {
                    return "disable";
                }
                else {
                    return "enable";
                }
            }
            , playbut: function () {
                if (this.status.gameStatus == "Standby" && this.status.timerStatus == "timeup") return "play";
                if (this.status.timerStatus == "counting") return "pause";
                if (this.status.timerStatus == "pause") return "redume";
                return "disable"
            }
            , nextbut: function () {
                if (this.status.time == 0 && this.status.auxTimer == false) return "disable";
                if (this.status.auxTimer) {
                    if (this.status.gameStatus != "Standby" || this.status.gameStatus != "ArrowsUp") {
                        return "stop";
                    }
                }
                if (this.status.gameStatus == "ArrowsUp" || this.status.gameStatus == "Standby") {
                    if (this.status.time == this.initGameProperty.endnum * this.initGameProperty.orderOfPlay.length) {
                        return "disable";
                    }
                    else {
                        return "nextend";
                    }
                }
                else if (this.status.time % this.initGameProperty.arrowsUp != 0) {
                    return "forward";
                }
                else if (this.status.gameStatus == 'GameOver') {
                    return "disabled";
                }
                else {
                    return "stop";
                }
            }
        }
        , watch: {
            showConfig: function (val) {
                if (val) {
                    this.showTimerConfig = false;
                }
            }
            , showTimerConfig: function (val) {
                if (val) {
                    this.showConfig = false;
                }
            }
            , 'consoleObj.timermode': function (val) {
                if (!this.isLoaded) return;
                this.rejectAnimationDotMatrix();
                    this.timerCore.rejectGameinfo();
                Vue.nextTick(function () {
                    this.counterInit();
                }, this);
            }
            , 'consoleObj.tournament.mode': function (val) {
                switch (val) {
                case "single":
                    this.consoleObj.tournament.gametime = 20;
                    this.consoleObj.tournament.setnum = 5;
                    this.consoleObj.tournament.arrowsUp = 6;
                    break;
                case "team":
                    this.consoleObj.tournament.gametime = 120;
                    this.consoleObj.tournament.setnum = 4;
                    this.consoleObj.tournament.arrowsUp = 4;
                    break;
                case "mixed":
                    this.consoleObj.tournament.gametime = 80;
                    this.consoleObj.tournament.setnum = 4;
                    this.consoleObj.tournament.arrowsUp = 4;
                    break;
                }
                this.consoleObj.tournament.shootOff = false;
                if (!this.isLoaded) return;
                this.timerCore.rejectGameinfo();
                this.rejectAnimationDotMatrix();
                this.counterInit();
            }
            , 'consoleObj.tournament.shootOff': function (val) {
                if (val) {
                    switch (this.consoleObj.tournament.mode) {
                    case "single":
                        this.consoleObj.tournament.gametime = 20;
                        this.consoleObj.tournament.setnum = 1;
                        this.consoleObj.tournament.arrowsUp = 2;
                        break;
                    case "team":
                        this.consoleObj.tournament.gametime = 60;
                        this.consoleObj.tournament.setnum = 1;
                        this.consoleObj.tournament.arrowsUp = 6;
                        break;
                    case "mixed":
                        this.consoleObj.tournament.gametime = 80;
                        this.consoleObj.tournament.setnum = 1;
                        this.consoleObj.tournament.arrowsUp = 4;
                        break;
                    }
                }
            }
            , 'consoleObj.orderOfPlay': function (val) {
                if (val != 3) return;
                if (this.consoleObj.endnum.digit1 % 2 != 0) this.consoleObj.endnum.digit1++;
            }
            , 'display.flipmin': function (val) {
                this.flipclock.setTime(val);
            }
            , 'toast.toastMessage': function (val) {
                if (this.toast.toastMessage === "") return;
                this.showToast();
            }, // todo watch gamestatus
            'status.gameStatus': function (val) {
                var isTournament = (this.consoleObj.timermode == "tournament");
                switch (val) {
                case "Standby":
                    this.status.statusColor = "shoot";
                        if(!isTournament){
                            this.doubleLineDotmatrixs.setColor("warn");
                            this.doubleLineDotmatrixs.tikatika(true);
                            this.dotmatrixs.dotstatus.changeValue('Standby!!');
                            this.dotmatrixs.dotstatus.moveLine(300);
                        }
                    break;
                case "Ready":
                    this.sound.play("ready");
                    this.status.statusColor = "warn";
                        if(!isTournament){
                            this.doubleLineDotmatrixs.setColor("warn");
                            this.dotmatrixs.dotstatus.changeValue('Ready'+String.fromCharCode(201));
                        }
                    break;
                case "Shoot":
                    this.sound.play("start");
                    this.status.statusColor = "shoot";
                        if(!isTournament){
                            this.doubleLineDotmatrixs.setColor("shoot");
                            this.dotmatrixs.dotstatus.changeValue('Shoot!');
                            this.dotmatrixs.dotstatus.blink([5000, 300, 300, 300, 3000],false);
                        }
                    break;
                case "Caution":
                    this.status.statusColor = "caution";
                        if(!isTournament)this.doubleLineDotmatrixs.setColor("caution");
                    break;
                case "Warn":
                    this.status.statusColor = "warn";
                        if(!isTournament)this.doubleLineDotmatrixs.setColor("warn");
                    break;
                case "ArrowsUp":
                    this.sound.play("end");
                    this.status.statusColor = "warn";
                        if(!isTournament){
                            this.doubleLineDotmatrixs.setColor("warn");
                            this.doubleLineDotmatrixs.tikatika(true);
                            this.dotmatrixs.dotstatus.changeValue('Cease Fire'+String.fromCharCode(201));
                            this.dotmatrixs.dotstatus.moveLine(300);
                        }
                    break;
                }
                if (this.consoleObj.timermode == 'default') return;
                //トーナメント時電光掲示制御
                switch (val) {
                case "Standby":
                    break;
                case "Ready":
                    if (this.status.stand == 1) {
                        this.dotmatrixs.lampl.changeValue(' READY ', "#ffffff", "#ff1c1c");
                        this.dotmatrixs.lampr.changeValue('       ', "#4b2a12", "#ff1c1c");
                    }
                    if (this.status.stand == 2) {
                        this.dotmatrixs.lampl.changeValue('       ', "#4b2a12", "#ff1c1c");
                        this.dotmatrixs.lampr.changeValue(' READY ', "#ffffff", "#ff1c1c");
                    }
                    break;
                case "Shoot":
                    if (this.status.stand == 1) {
                        this.dotmatrixs.lampl.changeValue(' SHOOT ', "#ffffff", "#367bff");
                        this.dotmatrixs.lampl.blink([300, 300, 300, 300, 3000],false);
                        this.dotmatrixs.lampr.changeValue('       ', "#4b2a12", "#ff1c1c");
                    }
                    if (this.status.stand == 2) {
                        this.dotmatrixs.lampl.changeValue('       ', "#4b2a12", "#ff1c1c");
                        this.dotmatrixs.lampr.changeValue(' SHOOT ', "#ffffff", "#367bff");
                        this.dotmatrixs.lampr.blink([300, 300, 300, 300, 3000],false);
                    }
                    break;
                case "Caution":
                    break;
                case "Warn":
                    break;
                case "ArrowsUp":
                    if (this.status.stand == 1) {
                        this.dotmatrixs.lampl.changeValue('       ', "#4b2a12", "#ff1c1c");
                    }
                    if (this.status.stand == 2) {
                        this.dotmatrixs.lampr.changeValue('       ', "#4b2a12", "#ff1c1c");
                    }
                    break;
                }
            }
            , 'status.timerStatus': function (val) {
                var inShooting = (this.status.gameStatus === "Shoot" || this.status.gameStatus === "Ready" || this.status.gameStatus === "Worn" || this.status.gameStatus === "Caution");
                if (val === "pause" && inShooting) {
                    this.sound.play("end");
                    this.statusColor = "warn";
                }
                if (val === "counting" && inShooting) {
                    this.sound.play("start");
                    reColor.call(this);
                }

                function reColor() {
                    switch (this.status.gameStatus) {
                    case "Standby":
                        this.status.statusColor = "shoot";
                        break;
                    case "Ready":
                        this.status.statusColor = "warn";
                        break;
                    case "Shoot":
                        this.status.statusColor = "shoot";
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
            }
            , 'display.end': function (val) {
                var digit = this.consoleObj.timermode == 'default' ? 2 : 1;
                if(!this.dotmatrixs.endnum.changeValue)return;
                this.dotmatrixs.endnum.changeValue(util.getStringNum(val, digit));
            }
            , 'display.min': function (val) {}, //todo watch
            'display.mmin': function (val) {
                if(!this.dotmatrixs.dropdown.dropDown)return;
                    this.dotmatrixs.dropdown.dropDown(val);
            }
            ,'display.stand':function(val){
                if (this.consoleObj.timermode != "default"||!this.dotmatrixs.standdot.changeValue) return;
                this.dotmatrixs.standdot.changeValue(val);
            }
            , 'consoleObj.tournament.firstStand': function (val) {
                this.initGameProperty.firstStand = val;
                if (this.status.gameStatus == "ArrowsUp" || this.status.gameStatus == "Standby") {
                    this.status.stand = val;
                    this.setFirstShooter();
                }
            }
            , 'display.remdot1': function (val) {
                //todo watch remdot
                if (this.consoleObj.timermode == "default") return;
                var digit = this.consoleObj.tournament.mode == 'team' ? 3 : 2;
                var self = this;
                if (this.status.stand > 0) {
                        this.dotmatrixs.remdot1.changeValue(util.getStringNum(val, digit))
                }
            }
            , 'display.remdot2': function (val) {
                if (this.consoleObj.timermode == "default") return;
                var digit = this.consoleObj.tournament.mode == 'team' ? 3 : 2;
                var self = this;
                if (this.status.stand > 0) {
                        this.dotmatrixs.remdot2.changeValue(util.getStringNum(val, digit));
                    }
            }
        }
        , methods: {
            rejectAnimationDotMatrix: function () {
                Object.keys(this.dotmatrixs).forEach(function (key) {
                    if (this[key].dot) {
                        if (this[key].stop) this[key].stop();
                        this[key].dot.target.innerHTML = '';
                        this[key] = {};
                    }
                }, this.dotmatrixs)
                if(this.doubleLineDotmatrixs.stop)
                this.doubleLineDotmatrixs.stop();
            }
            ,changeFirstShooter: function(tnum){
                if(this.status.gameStatus==""||this.status.gameStatus == "Standby"){
                    this.consoleObj.tournament.firstStand=tnum;
                }
            }
            , setFirstShooter: function () {
                if (this.consoleObj.timermode == 'default') return;
                if (this.status.inCount) return;
                if (this.consoleObj.tournament.firstStand == 1) {
                    this.dotmatrixs.lampl.changeValue(' FIRST ', "#ff1c1c", "#efe601");
                    this.dotmatrixs.lampl.moveLine(300);
                    this.dotmatrixs.lampr.changeValue('       ', "#4b2a12", "#ff1c1c");
                }
                if (this.consoleObj.tournament.firstStand == 2) {
                    this.dotmatrixs.lampl.changeValue('       ', "#4b2a12", "#ff1c1c");
                    this.dotmatrixs.lampr.changeValue(' FIRST ', "#ff1c1c", "#efe601");
                    this.dotmatrixs.lampr.moveLine(300);
                }
            }
            , counterInit: function () {
                var digit = this.consoleObj.timermode == 'default' ? 2 : 1;
                var startnum = (this.consoleObj.timermode == 'default') ? 999 : (this.consoleObj.tournament.mode == 'team') ? 999 : 99;
                this.flipclock = new FlipClock($('.clock'), startnum, {
                    clockFace: 'Counter'
                });
                this.flipclock.setTime(0);
                var isTournament = (this.consoleObj.timermode == "tournament");
                    this.dotmatrixs.endnum = new DotMatrixStyler("endnum", util.getStringNum(0, digit), {
                        colorOn: "#ff8b17"
                        , colorOff: "#4b2a12"
                        , digit: digit
                    });
                
                    this.dotmatrixs.dropdown = new DotMatrixStyler(isTournament?"tournamentDropDown":"dropDown", " ", {
                        colorOn: "#ff8b17"
                        , colorOff: "#4b2a12"
                        , digit: 1
                        , shape: 'square'
                    });
                    this.dotmatrixs.dropdown.dropDownInit();
                if (!isTournament) {//通常タイマー時
                    this.dotmatrixs.dotstatus = new DotMatrixStyler('dotStatus','  ',{
                        colorOn: "#ff8b17"
                        , colorOff: "#4b2a12"
                        , digit:6
                    });
                    this.doubleLineDotmatrixs = new DoubleLineDotMatrixCtrl(['lamp1','lamp2'],this);
                    
                    this.dotmatrixs.standdot = new DotMatrixStyler('dotStand','  ',{
                        colorOn: "#ff8b17"
                        , colorOff: "#4b2a12"
                        , digit:2
                    })
                }
                if (isTournament) {
                    this.dotmatrixs.remdot1 = new DotMatrixStyler("remdot1", "000", {
                        colorOn: "#ff8b17"
                        , colorOff: "#4b2a12"
                        , digit: this.consoleObj.tournament.mode == 'team' ? 3 : 2
                    });
                    this.dotmatrixs.remdot2 = new DotMatrixStyler("remdot2", "000", {
                        colorOn: "#ff8b17"
                        , colorOff: "#4b2a12"
                        , digit: this.consoleObj.tournament.mode == 'team' ? 3 : 2
                    });
                    this.dotmatrixs.lampl = new DotMatrixStyler("dotlamp1", "  CALM ", {
                        colorOn: "#ffffff"
                        , colorOff: "#00ac63"
                        , digit: 7
                        , shape: 'square'
                    });
                    this.dotmatrixs.lampr = new DotMatrixStyler("dotlamp2", " DOWN  ", {
                        colorOn: "#ffffff"
                        , colorOff: "#00ac63"
                        , digit: 7
                        , shape: 'square'
                    });
                }
            }
            , showCopy: function (b) {
                if (b) {
                    $('#splash').show();
                    this.isShowCopy = true;
                }
                else {
                    $('#splash').fadeOut(1000);
                    this.isShowCopy = false;
                }
            }
            , setFullScreen: function () {
                this.isAC = false;
                enterFullscreen();

                function enterFullscreen() {
                    var x = document.body;
                    if (x.webkitRequestFullScreen) {
                        x.webkitRequestFullScreen();
                    }
                    else {
                        x.requestFullScreen();
                    }
                }
            }
            , getStrageData: function (callback) {
                var json = localStorage.getItem('timerInitObj')
                if (json == null) {
                    if (callback) {
                        callback();
                    }
                    return;
                }
                var obj = $.parseJSON(json);
                var io = this.consoleObj;
                jQuery.extend(true, io, obj);
                if (callback) {
                    callback();
                }
            }
            , setStrageData: function () {
                var json = JSON.stringify(this.consoleObj);
                localStorage.setItem('timerInitObj', json);
            }
            , setSound: function (s) {
                this.consoleObj.sound = s;
                this.setHornSound([s]);
                this.selectSound = false;
                this.sound.play('start');
            }
            , doNextAct: function () {
                if (this.status.gameStatus == 'Standby' && this.playbut != 'disable') {
                    this.playpause();
                }
                else if (this.status.gameStatus != 'Standby' && this.nextbut != 'disable') {
                    this.nextEnd();
                }
            }
            , showToast: function (ss) {
                clearTimeout(this.toast.timeoutId);
                var ct = 3000;
                if (typeof ss === 'number') ct = ss;
                this.toast.visibleBelt = true;
                var self = this;
                this.toast.timeoutId = setTimeout(function () {
                    self.toast.visibleBelt = false;
                    self.toast.toastMessage = '';
                }, ct);
            }
            , reset: function () {
                if (this.status.time == 0) {
                    return false;
                }
                this.setConfig();
            }
            , playpause: function () {
                if (this.playbut == "play") {
                    this.timerCore.countDo();
                    return;
                }
                if (this.playbut == "pause") {
                    this.timerCore.pause();
                    return;
                }
                if (this.playbut == "redume") {
                    this.timerCore.redume();
                    return;
                }
            }
            , nextEnd: function () {
                this.timerCore.nextEnd();
            }
            , setSpecialTimer: function () {
                this.showTimerConfig = false;
                var c = this.consoleObj;
                var obj = {
                    readyTime: 0
                    , gameTime: getNum([c.addgametime.digit1, c.addgametime.digit2, c.addgametime.digit3])
                    , caution: 45000
                    , warn: 30000
                , };
                if (obj.gameTime < 10) {
                    this.toast.toastMessage = "設定値が不正です。<br>10秒以上を設定してください。"
                    return;
                }
                obj.caution = obj.gameTime < obj.caution ? 0 : obj.caution;
                obj.warn = obj.gameTime < obj.warn ? 0 : obj.warn;
                this.timerCore.setReady(false, obj);
                this.setStrageData();

                function getNum(arr) {
                    var total = 0;
                    for (var i = 0; i < arr.length; i++) {
                        total += arr[i] * Math.pow(10, i);
                    }
                    return total * 1000;
                }
            }
            , setConfig: function () {
                this.showConfig = false;
                var c = this.consoleObj;
                var temp = {
                    timerMode: ''
                    , gameTime: 0
                    , readyTime: 0
                    , caution: 45000
                    , warn: 30000
                    , arrowsUp: 0
                    , orderOfPlay: []
                    , endnum: 0
                };
                if (c.timermode == 'default') {
                    temp = {
                        timerMode: c.timermode
                        , gameTime: getNum([c.gametime.digit1, c.gametime.digit2, c.gametime.digit3])
                        , readyTime: getNum([c.readytime.digit1, c.readytime.digit2])
                        , caution: 45000
                        , warn: 30000
                        , arrowsUp: c.arrowsUp
                        , orderOfPlay: getOrder(c.orderOfPlay)
                        , endnum: getNum([c.endnum.digit1, c.endnum.digit2]) / 1000
                    };
                }
                if (c.timermode == 'tournament') {
                    temp = {
                        timerMode: c.timermode
                        , tournamentMode: c.tournament.mode
                        , firstStand: c.tournament.firstStand
                        , gameTime: c.tournament.gametime * 1000
                        , readyTime: 10 * 1000
                        , caution: 0
                        , warn: 0
                        , arrowsUp: c.tournament.arrowsUp
                        , orderOfPlay: ['TARGET1', 'TARGET2']
                        , setnum: c.tournament.setnum
                    };
                }
                if (temp.gameTime < temp.caution) {
                    temp.caution = 0;
                    temp.warn = 0;
                }
                if (temp.gameTime < 10) {
                    this.toast.toastMessage = "設定値が不正です。<br>10秒以上を設定してください。"
                    return;
                }
                this.timerCore.setGameinfo(temp);
                this.setStrageData();

                function getOrder(n) {
                    var ret = [];
                    switch (n) {
                    case 1:
                        ret = [""];
                        break;
                    case 2:
                        ret = ["AB", "CD"];
                        break;
                    case 3:
                        ret = ["AB", "CD", "EF"];
                        break;
                    }
                    return ret;
                }

                function getNum(arr) {
                    var total = 0;
                    for (var i = 0; i < arr.length; i++) {
                        total += arr[i] * Math.pow(10, i);
                    }
                    return total * 1000;
                }
            }
            , incredecre: function (bool, key, n) {
                switch (key) {
                case 'addgametime':
                    countTime.call(this, bool, key, n);
                    break;
                case 'gametime':
                    countTime.call(this, bool, key, n);
                    break;
                case 'readytime':
                    countTime.call(this, bool, key, n);
                    break;
                case 'endnum':
                    var endnum = this.consoleObj.endnum.digit2 * 10 + this.consoleObj.endnum.digit1;
                    endnum = bool ? endnum + 1 : endnum - 1;
                    if (this.consoleObj.orderOfPlay == 3) {
                        if (bool) {
                            endnum = endnum % 2 != 0 ? endnum + 1 : endnum;
                        }
                        else {
                            endnum = endnum % 2 != 0 ? endnum - 1 : endnum;
                        }
                    }
                    endnum = (endnum < 0) ? 0 : endnum;
                    endnum = (endnum > 99) ? 99 : endnum;
                    this.consoleObj.endnum.digit1 = endnum % 10;
                    this.consoleObj.endnum.digit2 = Math.floor(endnum / 10);
                    break;
                }

                function countTime(bool, key, n) {
                    if (bool) { //incre
                        this.consoleObj[key]['digit' + n]++;
                        if (this.consoleObj[key]['digit' + n] > 9) this.consoleObj[key]['digit' + n] = 9;
                    }
                    else {
                        this.consoleObj[key]['digit' + n]--;
                        if (this.consoleObj[key]['digit' + n] < 0) this.consoleObj[key]['digit' + n] = 0;
                    }
                }
            }
            , setHornSound: function (urdArray) {
                this.sound = new Howl({
                    src: urdArray
                    , sprite: {
                        ready: [4000, 3000]
                        , start: [8500, 2400]
                        , end: [0, 4000]
                    }
                });
            }
        }
        , mounted: function () {
            var ua = navigator.userAgent.toLowerCase();
            if (ua.indexOf('android') > 0 && ua.indexOf('chrome') > 0) this.isAC = true;
            //this.counterInit();
            var self = this;
            this.getStrageData(function () {
                self.setHornSound([self.consoleObj.sound]);
            })
            this.timerCore = new TimerCore(this)
            $('#app').show();
            setTimeout(function () {
                self.counterInit();
                self.isLoaded = true;
                $('#splash').fadeOut(1000);
            }, 6000);
        }
    });
}

function TimerCore(vueIns) {
    this.vue = vueIns;
    this.initTimerObj = vueIns.initTimerObj;
    this.initGameProperty = vueIns.initGameProperty;
    this.toast = vueIns.toast;
    this.reset = vueIns.setConfig;
    this.status = vueIns.status;
    this.display = vueIns.display;
    this.counterObj = {};
    this.intervalID = 0;
    this.standCounter = []; //3立時エンド計算用
    this.counterIndex = 0; //トーナメント時カウンター参照用
    this.countConf = {
        readyTime: 0
        , gameTime: 0
        , caution: 0
        , warn: 0
        , time: 0
    }
}
TimerCore.prototype.rejectGameinfo = function () {
    
    clearInterval(this.intervalID);
    
    this.status.gameStatus = '';
    this.status.inCount = false;
    this.status.timerStatus = "timeup";
    this.status.auxTimer = false;
    this.status.statusColor = '';
    this.initTimerObj.gameTime = 0;
    this.initTimerObj.readyTime = 0;
    this.status.stand = 0;
    this.status.time = 0;
    this.display.flipmin = 0;
    this.display.min = 0;
    this.display.mmin = 0;
    this.display.stand = '';
    this.display.end = 0;
    this.display.remdot1 = 0;
    this.display.remdot2 = 0;
    this.initGameProperty.arrowsUp = 0;
    this.initGameProperty.orderOfPlay = [];
}
TimerCore.prototype.setGameinfo = function (obj) {
        this.rejectGameinfo();
        this.initTimerObj.gameTime = obj.gameTime;
        this.initTimerObj.readyTime = obj.readyTime;
        this.initTimerObj.sign.caution = obj.caution;
        this.initTimerObj.sign.warn = obj.warn;
        this.initGameProperty.timerMode = obj.timerMode;
        this.initGameProperty.tournamentMode = obj.tournamentMode || '';
        this.initGameProperty.firstStand = obj.firstStand || 0;
        this.initGameProperty.arrowsUp = obj.arrowsUp;
        this.initGameProperty.orderOfPlay = obj.orderOfPlay;
        this.initGameProperty.endnum = obj.endnum;
        this.initGameProperty.setnum = obj.setnum || 0;
        this.status.stand = 0;
        this.status.time = 0;// 射立数
        this.inGameTime = [0,0];
        this.display.min = 0;
        this.display.mmin = 0;
        this.display.stand = '';
        this.display.end = 0;
        this.status.gameover = false;
        this.standCounter = new Array(this.initGameProperty.orderOfPlay.length);
        for (var i = 0; i < this.standCounter.length; i++) {
            this.standCounter[i] = 0;
        }
        this.setReady();
    }
    //射前設定
TimerCore.prototype.setReady = function (bool, obj) { //timer設定obj,bool一時停止状態で起動するか
    var self = this;
    clearInterval(self.intervalID);
    if (typeof obj === "object") { //直タイマー
        if (this.status.inCount) return;
        this.status.auxTimer = true;
        this.countConf.readyTime = obj.readyTime;
        this.countConf.gameTime = obj.gameTime;
        this.countConf.caution = obj.caution;
        this.countConf.warn = obj.warn;
        this.display.stand = "--";
        this.status.lastPosition = this.status.gameStatus;
        this.status.gameStatus = "Standby";
    }
    else { //通常時
        if (this.isFinished()) {
            this.display.remdot1 = 0;
            this.display.remdot2 = 0;
            return false;
        }
        this.status.gameStatus = "Standby";
        this.status.auxTimer = false;
        this.countConf.readyTime = this.initTimerObj.readyTime;
        this.countConf.gameTime = this.initTimerObj.gameTime;
        this.countConf.caution = this.initTimerObj.sign.caution;
        this.countConf.warn = this.initTimerObj.sign.warn;
        this.status.time++;
        if (this.initGameProperty.timerMode == 'default') {
            //立ち位置表示
            if (this.initGameProperty.orderOfPlay.length == 3 || this.status.time == 1 || this.status.time % this.initGameProperty.arrowsUp != 1) {
                this.status.stand++;
                if (this.status.stand > this.initGameProperty.orderOfPlay.length) {
                    this.status.stand = 1;
                }
            }
            //end進み
            //playorderが１か２立
            if ((this.initGameProperty.orderOfPlay.length == 2 && this.status.time % this.initGameProperty.orderOfPlay.length == 1) || this.initGameProperty.orderOfPlay.length == 1) {
                this.display.end++
            }
            //3立
            if (this.initGameProperty.orderOfPlay.length == 3) {
                this.standCounter[this.status.stand - 1]++;
                this.display.end = this.standCounter[this.status.stand - 1];
            }
        }
        else if (this.initGameProperty.timerMode == 'tournament') {
            //立ち位置表示
            if (this.status.time % this.initGameProperty.firstStand == 1) {
                this.status.stand = this.initGameProperty.firstStand;
            }
            else {
                this.status.stand++;
                if (this.status.stand > this.initGameProperty.orderOfPlay.length) {
                    this.status.stand = 1;
                }
            }
            //end転じてset進み
            if (this.status.time % this.initGameProperty.arrowsUp == 1) { //初回ないしやとりばさみ
                this.display.end++;
            }
        }
        this.display.stand = this.initGameProperty.orderOfPlay[this.status.stand - 1];
    }
    if (this.initGameProperty.timerMode == 'tournament' && this.initGameProperty.tournamentMode != 'single') { //トーナメント　チームミクス時カウンター保持
        if (this.status.time % this.initGameProperty.arrowsUp == 1) {
            this.counterObj = new DateCount();
            this.display.flipmin = this.countConf.gameTime / 1000;
        }
        else if(this.counterObj.isStarted[this.counterIndex]){
            this.display.flipmin = Math.ceil(this.counterObj.getElapsedTime(this.counterIndex) / 1000);
        }
    }
    else { //defaultないしトーナメントシングル
        this.counterObj = new DateCount();
        this.display.flipmin = this.countConf.gameTime / 1000;
    }
    this.display.min = this.display.flipmin;
    this.status.timerStatus = "timeup";
    //note remdot設定
    
    if (bool) {
    if(this.initGameProperty.timerMode=="tournament"){
        if(this.status.time%this.initGameProperty.arrowsUp 
           <
           this.initGameProperty.arrowsUp
           &&
           this.status.time%this.initGameProperty.arrowsUp!=0){
            this.setRemdot('next');
        }
    }
        this.countDo();
    }
    else {
        this.vue.setFirstShooter();
        this.toast.toastMessage = "STANDBY!!";
        this.setRemdot('standby');
    }
}

TimerCore.prototype.countDo = function () {
    this.counterIndex = 0;
    var isFirstShootAtTournament = false;
    if (this.initGameProperty.timerMode == 'tournament') {
        this.counterIndex = this.status.stand - 1;
        //SET初射ち時フラグ
        isFirstShootAtTournament = this.status.time % this.initGameProperty.arrowsUp == 1 ? true : false;
        
        if(this.initGameProperty.tournamentMode == 'single'){
            this.counterObj.start(this.counterIndex);
        }else{//mixed team
            if(this.status.time%this.initGameProperty.arrowsUp>0 && this.status.time%this.initGameProperty.arrowsUp<=2){//各セット初回
                this.counterObj.start(this.counterIndex);
            }else{
                if(!this.counterObj.isStarted[this.counterIndex])
                    this.counterObj.start(this.counterIndex);
                this.counterObj.redume(this.counterIndex);
            }
        }
    }else{//default
        this.counterObj.start(this.counterIndex);
    }
    this.status.inCount = true;
    this.status.timerStatus = "counting"
    var self = this;
    var nowc = this.counterObj.getElapsedTime(this.counterIndex)
    //tournament team mixedの場合は先行2巡目に準備時間を足し帳尻あわせる todo 
    if(this.initGameProperty.timerMode == 'tournament' && this.initGameProperty.tournamentMode != 'single' && this.status.time%this.initGameProperty.arrowsUp==3){
        this.counterObj.startDate[this.counterIndex]+=this.countConf.readyTime;
        if(nowc<this.countConf.readyTime)
            this.counterObj.startDate[this.counterIndex]-=this.countConf.readyTime-nowc;
    }
    
    this.intervalID = setInterval(function () { //1000分の5秒単位でタイマー状態確認
        //note count実行部
        var count = self.counterObj.getElapsedTime(self.counterIndex);
        if (!isFirstShootAtTournament && self.initGameProperty.timerMode == 'tournament') { // note set初射ち以外でのreadyのがれ
            count += self.countConf.readyTime;
        }
        
        if (self.countConf.readyTime > count) {
            self.status.gameStatus = "Ready";
            self.inGameTime[self.status.stand-1] = self.countConf.readyTime - count;
        }
        else {
            self.inGameTime[self.status.stand-1] = self.countConf.gameTime - (count - self.countConf.readyTime);
            if (self.countConf.readyTime + (self.countConf.gameTime - (self.countConf.caution > 0 ? self.countConf.caution : self.countConf.warn)) > count) {
                self.status.gameStatus = "Shoot";
            }
            else if (self.countConf.readyTime + (self.countConf.gameTime - self.countConf.warn) > count) {
                self.status.gameStatus = "Caution";
            }
            else if (self.countConf.readyTime + self.countConf.gameTime > count) {
                self.status.gameStatus = "Warn";
            }
            else if (self.countConf.readyTime + self.countConf.gameTime <= count) {
                if (!self.status.auxTimer && self.status.time % self.initGameProperty.arrowsUp != 0) { //射順timeup終了
                    //todo nextEndとの兼ね合い懸案
                    if (self.initGameProperty.timerMode == 'default'){
                    self.setDispMinMmin();
                    self.setReady(true);
                    return;
                    }
                    if (self.initGameProperty.timerMode == 'tournament'){
                        self.setDispMinMmin();
                        if(self.initGameProperty.tournamentMode == 'single'){
                            self.setReady(true);
                            return;
                        }else{
                            self.counterObj.pause(self.counterIndex);
                            self.setReady(true);
                            return;
                        }
                    }
                }
                self.stop(); //エンド終了
            }
        }
        var fliplag = 0;
        if (self.countConf.readyTime > count + 600) {
            fliplag = self.countConf.readyTime - (count + 600);
        }
        else {
            fliplag = self.countConf.gameTime - (count + 600 - self.countConf.readyTime);
        }
        var flipmin = fliplag / 1000;
        flipmin = Math.ceil(flipmin);
        if (self.display.flipmin != flipmin) {
            self.display.flipmin = flipmin;
        }
        self.setDispMinMmin();

    }, 5);
}
TimerCore.prototype.setDispMinMmin = function() { //flip以外のdisplay　min　mminの決定
    var min = this.inGameTime[this.status.stand-1] / 1000;
    var dispMin = 0;
    dispMin = Math.ceil(min);
    if (this.display.min != dispMin) {
        if (dispMin == 0) {
            this.display.mmin = 0;
        }
        else {
            this.display.mmin = 99;
        }
        this.display.min = dispMin;
    }
    else {
        this.display.mmin = Math.round((min % 1) * 100);
        if(this.initGameProperty.timerMode == 'tournament'){
            switch(this.status.stand){
                case 1:
                    this.display.remdot1 == dispMin;
                    break;
                case 2:
                    this.display.remdot2 == dispMin;
                    break;
            }
        }
    }
    if (this.initGameProperty.timerMode == 'tournament') {
        if (this.status.stand != 0) {
            this.display['remdot' + this.status.stand] = this.display.min;
        }
    }
}
TimerCore.prototype.stop = function () {
    clearInterval(this.intervalID);
    this.status.inCount = false;
    this.status.timerStatus = "timeup"
    if (this.status.auxTimer) {
        this.status.auxTimer = false;
        if (this.status.lastPosition != "ArrowsUp") {
            this.vue.sound.play('end');
            this.countConf.readyTime = this.initTimerObj.readyTime;
            this.countConf.gameTime = this.initTimerObj.gameTime;
            this.countConf.caution = this.initTimerObj.sign.caution;
            this.countConf.warn = this.initTimerObj.sign.warn;
            this.display.flipmin = this.countConf.gameTime / 1000;
        }
        else {
            this.display.flipmin = 0;
        }
        this.status.gameStatus = this.status.lastPosition;
    }
    else {
        if (this.isFinished()) {
            //round finish
            this.toast.toastMessage = "Game is over!";
            this.status.gameStatus = 'GameOver';
            this.vue.sound.play('end');
            this.setRemdot("arrowsup");
        }
        else {
            // end end
            this.toast.toastMessage = "Cease Fire!"
            this.status.gameStatus = "ArrowsUp";
            this.setRemdot("arrowsup");
        }
        this.display.flipmin = 0;
    }
    this.display.mmin = 0;
    this.display.min = 0;
}
TimerCore.prototype.isFinished = function (time) {
    if (this.initGameProperty.endnum == 0) return false;
    var times;
    if (time) {
        times = time;
    }
    else {
        times = this.status.time;
    }
    var ret = false;
    if (this.initGameProperty.timerMode == "default") {
        ret = (this.display.end == this.initGameProperty.endnum) && (times == this.initGameProperty.orderOfPlay.length * this.initGameProperty.endnum);
    }
    if (this.initGameProperty.timerMode == "tournament") {
        ret = (this.display.end == this.initGameProperty.setnum) && (times%this.initGameProperty.arrowsUp == 0);
    }
    this.status.gameover = ret;
    return ret;
}
TimerCore.prototype.pause = function () {
    this.status.timerStatus = "pause";
    this.counterObj.pause(this.counterIndex);
}
TimerCore.prototype.redume = function () {
    this.status.timerStatus = "counting";
    this.counterObj.redume(this.counterIndex);
}
//end移動
TimerCore.prototype.nextEnd = function (isAllCounted){
    var self = this;
    if (this.status.time == 0 && this.status.auxTimer == false) return;
    
    if (this.status.auxTimer) {//追加時間タイマ時
        this.stop();
        return;
    }
    ///////////////通常タイマ
    //エンド最終射回時以外
    if (this.status.time % this.initGameProperty.arrowsUp != 0) {
        if (this.status.gameStatus == "Standby") {
            this.setReady();
        }
        else {
            if (this.initGameProperty.timerMode == 'default'){
                this.setReady(true);
            }else if(this.initGameProperty.timerMode == 'tournament'){
                if(this.initGameProperty.tournamentMode != 'single'){
                    this.counterObj.pause(this.counterIndex);
                    this.setReady(true);
                    return;
                }else{
                    //this.setDispMinMmin(inGameTime);
                    this.setReady(true);
                    return;
                }
            }
            
        }
    }
    //最初回準備状態かエンド終了時停止状態
    else if (this.status.gameStatus == "ArrowsUp" || this.status.gameStatus == "Standby") {
        this.setReady();
    }
    //エンド最終射回時
    else {
        this.stop();
        var self = this;
        if (this.initGameProperty.timerMode == 'tournament') {//todo エンド終了
            this.setRemdot('arrowsup');
        }
    }
}
TimerCore.prototype.setRemdot = function(mode) {
    this.setDispMinMmin();
    if (this.initGameProperty.timerMode != "tournament") return;
    var dispmode = mode;
    Vue.nextTick(function(){
        var self = this;
     switch(dispmode){
         case 'standby'://スタンバイ時ゲームタイム掲示
             this.display.remdot1 = this.initTimerObj.gameTime/1000;
             this.display.remdot2 = this.initTimerObj.gameTime/1000;
             break;
        case 'fixed'://静的にflipと合わせるだけ
            this.display.remdot1 = this.display.min;
            this.display.remdot2 = this.display.min;
            break;
        case 'next'||'timeout'://ボタン操作による移動//時間切れによる移動
            if(this.initGameProperty.tournamentMode=='single'){
            switch (this.status.stand) {
            case 1:
                this.display.remdot1 = this.display.min;
                this.vue.dotmatrixs.remdot2.blink([5000, 300], false, function () {
                    self.vue.dotmatrixs.remdot2.changeValue(util.getStringNum(self.initTimerObj.gameTime / 1000, self.vue.dotmatrixs.remdot1.dot.digit));
                });
                break;
            case 2:
                this.display.remdot2 = this.display.min;
                this.vue.dotmatrixs.remdot1.blink([5000, 300], false, function () {
                    self.vue.dotmatrixs.remdot1.changeValue(util.getStringNum(self.initTimerObj.gameTime / 1000, self.vue.dotmatrixs.remdot2.dot.digit));
                });
                break;
            }
        }
            break;
        case 'arrowsup'://完全に終了
                this.vue.dotmatrixs.remdot1.blink([5000, 300], false, function () {
                    self.vue.dotmatrixs.remdot1.changeValue(util.getStringNum(0, self.vue.dotmatrixs.remdot1.dot.digit));
                });
                this.vue.dotmatrixs.remdot2.blink([5000, 300], false, function () {
                    self.vue.dotmatrixs.remdot2.changeValue(util.getStringNum(0, self.vue.dotmatrixs.remdot2.dot.digit));
                });
            break;
    }
   
    },this);
}

TimerCore.prototype.dotMatrixFinishedCount = function(index){
    //todo finished dot
    var targetCode = 0;
    var self = this;
    var status = '';
    
    if(index)targetCode = index;
    if(targetCode == 0||targetCode == 1){
        this.vue.dotmatrixs.remdot2.blink([5000, 300], false, function () {
            self.vue.dotmatrixs.remdot2.changeValue('00');
        });
    }
    if(targetCode == 0||targetCode == 2){
        this.vue.dotmatrixs.remdot1.blink([5000, 300], false, function () {
            self.vue.dotmatrixs.remdot1.changeValue('00');
        });
    }
}
function DateCount() {
    this.startDate = [0, 0];
    this.pauseTime = [0, 0];
    this.redumeTime = [0, 0];
    this.elapsedTime = [0, 0];
    this.isStarted = [false,false];
}
DateCount.prototype.start = function (n) {
    var index = 0;
    if (n) index = n;
    this.startDate[index] = Date.now();
    this.isStarted[index] = true;
}
DateCount.prototype.getElapsedTime = function (n) {
    var index = 0;
    if (n) index = n;
    var nowDate = Date.now();
    if (this.pauseTime[index] > 0) {
        this.redumeTime[index] += nowDate - this.pauseTime[index];
        this.pauseTime[index] = nowDate;
    }
    this.elapsedTime[index] = nowDate - this.startDate[index] - this.redumeTime[index];
    return this.elapsedTime[index];
}
DateCount.prototype.pause = function (n) {
    var index = 0;
    if (n) index = n;
    this.pauseTime[index] = Date.now();
}
DateCount.prototype.redume = function (n) {
    var index = 0;
    if (n) index = n;
    var nowDate = Date.now();
    this.redumeTime[index] += this.pauseTime[index] == 0 ? 0 : nowDate - this.pauseTime[index];
    this.pauseTime[index] = 0;
    this.inAnimation = false;
}

function DotMatrixStyler(targetID, val, param) {
    this.intervalID = -1;
    this.blinkID = -1;
    this.suicideID = -1;
    this.dot = new DotMatrix(targetID);
    this.dot.CODE_SEG_TABLE[201] = [64, 0, 64, 0, 64];
    this.dot.target.innerHTML = '';
    this.inAnimation = false;
    this.isDropDown = false;
    this.frame = 0;
    this.STRS = [];
    this.value = val
    param.value = val;
    this.dot.draw(param);
}
DotMatrixStyler.prototype.changeValue = function (val, onCol, offCol) {
    this.stop();
    if (onCol) {
        this.dot.colorOn = onCol;
    }
    if (offCol) {
        this.dot.colorOff = offCol;
    }
    if (val) {
        this.value = val;
        this.dot.changeValue(val);
    }
}
DotMatrixStyler.prototype.moveLine = function (spd) {
    clearInterval(this.intervalID);
    var txt = this.value;
    var digit = this.dot.digit == 0 ? txt.length : this.dot.digit;
    for (var i = 0; i < digit; i++) {
        txt = txt + String.fromCharCode(32);
    }
    this.inAnimation = true;
    var self = this;
    this.intervalID = setInterval(function () {
        self.dot.changeValue(txt);
        txt = txt.slice(1) + txt.slice(0, 1);
    }, spd);
}
DotMatrixStyler.prototype.stop = function () {
    this.inAnimation = false;
    clearInterval(this.intervalID);
    clearTimeout(this.blinkID);
    clearTimeout(this.suicideID);
}
DotMatrixStyler.prototype.suicideValue = function (dt) {
    var space = '';
    for (var i = 0; i < this.dot.digit; i++) {
        space = space + String.fromCharCode(32);
    }
    var self = this;
    this.suicideID = setTimeout(function () {
        self.dot.changeValue(space);
        self.value = space;
    }, dt);
}
DotMatrixStyler.prototype.blink = function (ary, b, callback) {//b = 初回時消すかどうか　falseで初回消す
    this.stop();
    var val = this.value;
    var space = '';
    for (var i = 0; i < this.dot.digit; i++) {
        space = space + String.fromCharCode(32);
    }
    if (ary.length % 2 == 1) { //最後が消える設定なら
        this.value = space;
    }
    var self = this;
    blinkTurn(ary, false, callback);

    function blinkTurn(ar, b, cb) {
        clearTimeout(self.blinkID);
        self.blinkID = setTimeout(function () {
            ar.shift();
            self.dot.changeValue(!b ? space : val);
            if (ar.length == 0) {
                if (typeof cb == 'function') {
                    cb();
                }
                return;
            }
            blinkTurn(ar, !b, cb);
        }, ar[0]);
    }
}
DotMatrixStyler.prototype.dropDownInit = function () {
    this.isDropDown = true;
    this.dot.digit = 1;
    this.dot.changeValue(" ");
    this.dot.CODE_SEG_TABLE[200] = [0, 0, 0, 6, 6];
    this.dot.CODE_SEG_TABLE[201] = [0, 0, 0, 54, 54];
    this.dot.CODE_SEG_TABLE[202] = [48, 48, 0, 54, 54];
    this.dot.CODE_SEG_TABLE[203] = [54, 54, 0, 54, 54];
    this.dot.CODE_SEG_TABLE[204] = [0, 0, 0, 0, 0];
    this.STRS = [
        String.fromCharCode(204)
        , String.fromCharCode(200)
        , String.fromCharCode(201)
        , String.fromCharCode(202)
        , String.fromCharCode(203)
    ];
    /*
    this.dot.CODE_SEG_TABLE[200] = [1, 1, 1, 1, 1];
    this.dot.CODE_SEG_TABLE[201] = [2, 2, 2, 2, 2];
    this.dot.CODE_SEG_TABLE[202] = [4, 4, 4, 4, 4];
    this.dot.CODE_SEG_TABLE[203] = [8, 8, 8, 8, 8];
    this.dot.CODE_SEG_TABLE[204] = [17, 17, 17, 17, 17]; //16
    this.dot.CODE_SEG_TABLE[205] = [34, 34, 34, 34, 34]; //32
    this.dot.CODE_SEG_TABLE[206] = [68, 68, 68, 68, 68]; //64
    this.dot.CODE_SEG_TABLE[207] = [72, 72, 72, 72, 72];
    this.dot.CODE_SEG_TABLE[208] = [81, 81, 81, 81, 81];
    this.dot.CODE_SEG_TABLE[209] = [98, 98, 98, 98, 98]; //
    this.dot.CODE_SEG_TABLE[210] = [100, 100, 100, 100, 100];
    this.dot.CODE_SEG_TABLE[211] = [113, 113, 113, 113, 113]; //1
    this.dot.CODE_SEG_TABLE[212] = [114, 114, 114, 114, 114];
    this.dot.CODE_SEG_TABLE[213] = [116, 116, 116, 116, 116];
    this.dot.CODE_SEG_TABLE[214] = [120, 120, 120, 120, 120];
    this.dot.CODE_SEG_TABLE[215] = [121, 121, 121, 121, 121];
    this.dot.CODE_SEG_TABLE[216] = [122, 122, 122, 122, 122];
    this.dot.CODE_SEG_TABLE[217] = [124, 124, 124, 124, 124]; //
    this.dot.CODE_SEG_TABLE[218] = [124, 124, 124, 124, 124];
    this.dot.CODE_SEG_TABLE[219] = [125, 125, 125, 125, 125];
    this.dot.CODE_SEG_TABLE[220] = [126, 126, 126, 126, 126];
    this.dot.CODE_SEG_TABLE[221] = [126, 126, 126, 126, 126]; //
    this.dot.CODE_SEG_TABLE[222] = [126, 126, 126, 126, 126];
    this.dot.CODE_SEG_TABLE[223] = [127, 127, 127, 127, 127];
    this.dot.CODE_SEG_TABLE[224] = [0, 0, 0, 0, 0];
    this.STRS = [
                String.fromCharCode(224)
                , String.fromCharCode(200)
                , String.fromCharCode(201)
                , String.fromCharCode(202)
                , String.fromCharCode(203)
                , String.fromCharCode(204)
                , String.fromCharCode(205)
                , String.fromCharCode(206)
                , String.fromCharCode(207)
                , String.fromCharCode(208)
                , String.fromCharCode(209)
                , String.fromCharCode(210)
                , String.fromCharCode(211)
                , String.fromCharCode(212)
                , String.fromCharCode(213)
                , String.fromCharCode(214)
                , String.fromCharCode(215)
                , String.fromCharCode(216)
                , String.fromCharCode(217)
                , String.fromCharCode(218)
                , String.fromCharCode(219)
                , String.fromCharCode(220)
                , String.fromCharCode(221)
                , String.fromCharCode(222)
                , String.fromCharCode(223)
                , String.fromCharCode(223)
            ];*/
    // this.STRS.reverse();
}
DotMatrixStyler.prototype.dropDown = function (nn) {
    if(nn<0)nn=0;
    var SPLITE = 20;
    nn = nn == 100 ? 99 : nn;
    var frame = Math.floor(nn / SPLITE);
    if (this.frame == frame) return;
    this.frame = frame;
    if (frame < 0 || frame >= this.STRS.length) {
        this.frame = 0;
    }
    this.dot.changeValue(this.STRS[frame]);
}
function DoubleLineDotMatrixCtrl(ary,v){//設定上原則2個固定,v=vue
    for(var i=0;i<ary.length;i++){
        v.dotmatrixs["defaultLampLine"+(i+1)]=new DotMatrixStyler(ary[i],'   ',{
                        colorOn: "#ff1c1c"
                        , colorOff: "#343434"
                        , digit:3
                        , shape: 'square'
                    });
        v.dotmatrixs["defaultLampLine"+(i+1)].dot.CODE_SEG_TABLE[200] = [127, 127, 127, 127, 127];
    }
    this.dtmLamp = [v.dotmatrixs.defaultLampLine1,v.dotmatrixs.defaultLampLine2];
    this.intervalID = 0;
}
DoubleLineDotMatrixCtrl.prototype.setColor = function(comandID){
    this.stop();
    var dispFlash = String.fromCharCode(200)+String.fromCharCode(200)+String.fromCharCode(200);
    switch(comandID){
        case 'warn':
            this.dtmLamp[0].changeValue(dispFlash,"#ff1c1c","#343434");
            this.dtmLamp[1].changeValue(dispFlash,"#ff1c1c","#343434");
            break;
        case 'caution':
            this.dtmLamp[0].changeValue(dispFlash,"#efe601","#343434");
            this.dtmLamp[1].changeValue(dispFlash,"#efe601","#343434");
            break;
        case 'shoot':
            this.dtmLamp[0].changeValue(dispFlash,"#367bff","#343434");
            this.dtmLamp[1].changeValue(dispFlash,"#367bff","#343434");
            break;
    }
}
DoubleLineDotMatrixCtrl.prototype.stop = function(){
    clearInterval(this.intervalID);
}
DoubleLineDotMatrixCtrl.prototype.tikatika = function(){
    clearInterval(this.intervalID);
    var self = this;
    var t = tika(true);
    this.intervalID = setInterval(function(b){
        t();
    },500);
    function tika(b){
        var bool = b;
        return function(){
            if(bool){
                self.dtmLamp[0].changeValue(' '+String.fromCharCode(200)+' ');
                self.dtmLamp[1].changeValue(String.fromCharCode(200)+' '+String.fromCharCode(200));
            }else{
                self.dtmLamp[1].changeValue(' '+String.fromCharCode(200)+' ');
                self.dtmLamp[0].changeValue(String.fromCharCode(200)+' '+String.fromCharCode(200));
            }
            bool = !bool;
        }
    }
}