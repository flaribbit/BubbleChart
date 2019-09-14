//读取文件
var v;
document.getElementById('inputFile').onchange = function () {
    console.log('file loaded');
    //隐藏控件
    this.setAttribute('hidden', true);
    //读取文件内容
    var fileReader = new FileReader();
    fileReader.readAsText(this.files[0], config.encoding);
    fileReader.onload = function () {
        try {
            var data = d3.csvParse(this.result);
            v = new Visual(data);
            /*for (var i = 0; i < 24; i++) {
                v.AddBubble(data[i]);
            }*/
            v.timer=setInterval(() => {
                //每秒一组数据
                if(v.frame%60==0){
                //if(true){//调试用
                    if(!data[v.line]){
                        clearInterval(v.timer);
                    }
                    //把不是0的复制到from里面
                    v.from=[];
                    /*for(var i=0;i<v.to.length;i++){
                        if(v.to[i].r!=0){
                            v.from.push(v.to[i]);
                        }
                    }*/
                    for(var i=0;i<v.to.length;i++){
                        if(v.to[i].r!=0){
                            v.from.push(v.bubbles[i]);
                        }
                    }
                    //把下一组数据添加到to里面
                    v.to=[];
                    while(data[v.line].time==Math.floor(v.frame/60)){
                    //while(data[v.line].time==v.frame){//调试用
                        var elem=v.bubbles.find(e=>e.id==data[v.line].name);
                        //如果之前有这个元素
                        if(elem){
                            //console.log("之前有这个元素");
                            var bubble = {
                                id: elem.id,
                                x: elem.x,
                                y: elem.y,
                                r: parseFloat(data[v.line].value),
                                c: elem.c
                            };
                            v.to.push(bubble);
                        }else{
                            v.AddBubble(data[v.line]);
                        }
                        //v.to.push(data[v.line]);
                        //v.line++;
                        v.line++;
                        if(v.line>=data.length){
                            break;
                        }
                    }
                    //排序 准备计算排名
                    v.to.sort(v.SortByValue);
                    //如果from里没有 补0
                    for(var i=0;i<v.to.length;i++){
                        v.to[i].rank=i+1;
                        if(!v.from.find(e=>e.id==v.to[i].id)){
                            var bubble = {
                                id: v.to[i].id,
                                x: v.to[i].x,
                                y: v.to[i].y,
                                r: 0,
                                c: v.to[i].c,
                            };
                            v.from.push(bubble);
                        }
                    }
                    //如果to里没有 补0 并复制到bubbles中
                    v.bubbles=[];
                    v.from.sort(v.SortById);
                    for(var i=0;i<v.from.length;i++){
                        var bubble = {
                            id: v.from[i].id,
                            x: v.from[i].x,
                            y: v.from[i].y,
                            r: 0,
                            c: v.from[i].c,
                        };
                        if(!v.to.find(e=>e.id==v.from[i].id)){
                            v.to.push(bubble);
                        }
                        //v.bubbles.push(v.from[i]);
                        v.bubbles.push(bubble);
                    }
                    v.to.sort(v.SortById);
                    //console.log(v.from);
                    //console.log(v.to);
                }
                v.Update();
                v.Draw();
                v.frame++;
            }, 1000/30);
        } catch (error) {
            alert(error);
        }
    }
}

class Visual {
    constructor(data) {
        console.log(data);
        this.bubbles = [];
        this.from = [];
        this.to = [];
        this.camera={
            x:0,
            y:0,
            z:1
        };
        this.canvas=document.getElementById("maincanvas");
        this.ctx=this.canvas.getContext("2d");
        this.line=0;
        this.frame=60;
        this.elasticity = 0.6;
        this.scale = 1;
    }
    SortByValue(a,b){
        if(a.r<b.r){
            return 1;
        }else if(a.r>b.r){
            return -1;
        }else{
            return 0;
        }
    }
    SortById(a,b){
        if(a.id<b.id){
            return 1;
        }else if(a.id>b.id){
            return -1;
        }else{
            return 0;
        }
    }
    Random(lower, upper) {
        var t = Math.random();
        return (1 - t) * lower + t * upper;
    }
    RandomColor() {
        var t = Math.floor(Math.random() * config.colors.length);
        return config.colors[t];
    }
    //添加一个气泡，位置随机，颜色随机
    AddBubble(data) {
        var bubble = {
            id: data.name,
            x: this.Random(this.camera.x-0.5*this.camera.z*config.width, this.camera.x+0.5*this.camera.z*config.width),
            y: this.Random(this.camera.y-0.5*this.camera.z*config.height, this.camera.y+0.5*this.camera.z*config.height),
            r: parseFloat(data.value),
            c: this.RandomColor(),
        };
        this.to.push(bubble);
    }
    //更新气泡位置数据
    Update() {
        var distance, t, dx, dy, interp, area;
        if(this.camera.z<4){
            //this.camera.z*=1.05;
        }
        interp=v.frame%60/60;
        area=0;
        for (var i = 0; i < this.bubbles.length; i++) {
            //更新气泡大小
            this.bubbles[i].r=(1-interp)*this.from[i].r+interp*this.to[i].r;
            //计算气泡总面积
            area+=this.bubbles[i].r*this.bubbles[i].r;
            //聚集气泡
            if((t=this.camera.x-0.5*config.width/this.camera.z-this.bubbles[i].x+this.bubbles[i].r)>0){
                this.bubbles[i].x+=this.elasticity*t;
            }else if((t=this.camera.x+0.5*config.width/this.camera.z-this.bubbles[i].x-this.bubbles[i].r)<0){
                this.bubbles[i].x+=this.elasticity*t;
            }
            if((t=this.camera.y-0.5*config.height/this.camera.z-this.bubbles[i].y+this.bubbles[i].r)>0){
                this.bubbles[i].y+=this.elasticity*t;
            }else if((t=this.camera.y+0.5*config.height/this.camera.z-this.bubbles[i].y-this.bubbles[i].r)<0){
                this.bubbles[i].y+=this.elasticity*t;
            }
            //互相排斥
            for (var j = i + 1; j < this.bubbles.length; j++) {
                dx = this.bubbles[j].x - this.bubbles[i].x;
                dy = this.bubbles[j].y - this.bubbles[i].y;
                distance = Math.sqrt(dx * dx + dy * dy);
                if ((t = distance - this.bubbles[i].r - this.bubbles[j].r*this.scale) < 0) {
                    t = t * this.elasticity / distance;
                    this.bubbles[i].x += dx * t;
                    this.bubbles[i].y += dy * t;
                    this.bubbles[j].x -= dx * t;
                    this.bubbles[j].y -= dy * t;
                }
            }
        }
        this.camera.z=Math.sqrt(config.width*config.height/area/6);
    }
    //绘制气泡
    Draw() {
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        for(var i=0;i<this.bubbles.length;i++){
            var dispx=(this.bubbles[i].x-this.camera.x)*this.camera.z+0.5*config.width;
            var dispy=(this.camera.y-this.bubbles[i].y)*this.camera.z+0.5*config.height;
            var dispr=this.bubbles[i].r*this.camera.z;
            this.ctx.fillStyle=this.bubbles[i].c;
            this.ctx.beginPath();
            this.ctx.arc(dispx,dispy,dispr,0,Math.PI*2);
            this.ctx.closePath();
            this.ctx.fill();
            //计算宽度
            this.ctx.font="12px 微软雅黑";
            var font=Math.floor(12/this.ctx.measureText(this.bubbles[i].id).width*dispr*1.6);
            var fontmax=0.6*this.bubbles[i].r*this.camera.z;
            if(font>fontmax){
                //限制字体大小
                font=fontmax;
            }
            this.ctx.font=font+'px 微软雅黑';
            this.ctx.fillStyle="#000000";
            this.ctx.textAlign="center";
            this.ctx.fillText(this.bubbles[i].id,dispx,dispy);
            //绘制数据
            this.ctx.font=Math.floor(font*0.6)+'px 微软雅黑';
            this.ctx.fillText(this.bubbles[i].r.toFixed(2),dispx,dispy+font);
            //绘制排名
            if(this.to[i].rank<4){
                this.ctx.font=Math.floor(font*0.5)+'px 微软雅黑';
                this.ctx.fillText("第"+this.to[i].rank+"位",dispx,dispy-font);
            }
        }
        //this.ctx.font="12px 微软雅黑";
        //this.ctx.textAlign="left";
        //this.ctx.fillStyle="#FF0000";
        //this.ctx.fillText("frame "+this.frame,0,12);
        //this.ctx.fillText(this.from[0].r,0,24);
    }
}
