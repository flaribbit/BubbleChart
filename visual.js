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
            for (var i = 0; i < 24; i++) {
                v.addBubble(data[i]);
            }
            setInterval(() => {
                v.frame++;
                v.Update();
                //每秒计算6次
                if(v.frame%10==0){
                    
                }
                //每秒一组数据
                if(v.frame%60==0){

                }
                v.Draw();
            }, 1000/60);
        } catch (error) {
            alert(error);
        }
    }
}

class Visual {
    constructor(data) {
        console.log(data);
        this.bubbles = [];
        this.camera={
            x:0,
            y:0,
            z:1
        };
        this.canvas=document.getElementById("maincanvas");
        this.ctx=this.canvas.getContext("2d");
        this.frame=0;
        this.elasticity = 0.6;
        this.scale = 1;
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
    addBubble(data) {
        var bubble = {
            id: data.name,
            x: this.Random(this.camera.x-0.5*this.camera.z*config.width, this.camera.x+0.5*this.camera.z*config.width),
            y: this.Random(this.camera.y-0.5*this.camera.z*config.height, this.camera.y+0.5*this.camera.z*config.height),
            r: parseFloat(data.value),
            c: this.RandomColor(),
        };
        this.bubbles.push(bubble);
    }
    //更新气泡位置数据
    Update() {
        var distance, t, dx, dy;
        if(this.camera.z<2.2){
            this.camera.z*=1.005;
        }
        for (var i = 0; i < this.bubbles.length; i++) {
            if((t=this.camera.x-0.4*config.width/this.camera.z-this.bubbles[i].x)>0){
                this.bubbles[i].x+=this.elasticity*t;
            }else if((t=this.camera.x+0.4*config.width/this.camera.z-this.bubbles[i].x)<0){
                this.bubbles[i].x+=this.elasticity*t;
            }
            if((t=this.camera.y-0.4*config.height/this.camera.z-this.bubbles[i].y)>0){
                this.bubbles[i].y+=this.elasticity*t;
            }else if((t=this.camera.y+0.4*config.height/this.camera.z-this.bubbles[i].y)<0){
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
            this.ctx.textAlign="center";
            this.ctx.font="12px 微软雅黑";
            this.ctx.font=parseInt(12/this.ctx.measureText(this.bubbles[i].id).width*dispr*1.6)+'px 微软雅黑';
            this.ctx.fillStyle="#000000";
            this.ctx.fillText(this.bubbles[i].id,dispx,dispy);
        }
    }
}
