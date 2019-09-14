//读取文件
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
            var v = new Visual(data);
            for (var i = 0; i < 24; i++) {
                v.addBubble(data[i]);
            }
            v.Draw();
            setInterval(() => {
                v.Update();
                v.Draw();
            }, 100);
        } catch (error) {
            alert(error);
        }
    }
}

class Visual {
    constructor(data) {
        console.log(data);
        this.bubbles = [];
        this.border = {
            top: 0,
            bottom: 720,
            left: 0,
            right: 1280,
        };
        this.ctx=document.getElementById("maincanvas").getContext("2d");
        this.elasticity = 0.6;
        this.scale= 1;
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
            x: this.Random(this.border.left, this.border.right),
            y: this.Random(this.border.bottom, this.border.top),
            //x: this.Random(0, 320),
            //y: this.Random(0, 240),
            r: data.value,
            c: this.RandomColor(),
        };
        this.bubbles.push(bubble);
    }
    //删除一个气泡
    RemoveBubble() {
    }
    //更新气泡位置数据
    Update() {
        var distance, t, dx, dy, r;
        this.scale*=1.08;
        for (var i = 0; i < this.bubbles.length; i++) {
            r=this.bubbles[i].r*this.scale;
            //上边界
            if ((t = this.bubbles[i].y - r - this.border.top) < 0) {
                this.bubbles[i].y -= t * this.elasticity * 2;
                this.scale*=0.99;
            }
            //下边界
            if ((t = this.bubbles[i].y + r - this.border.bottom) > 0) {
                this.bubbles[i].y -= t * this.elasticity * 2;
                this.scale*=0.99;
            }
            //左边界
            if ((t = this.bubbles[i].x - r - this.border.left) < 0) {
                this.bubbles[i].x -= t * this.elasticity * 2;
                this.scale*=0.99;
            }
            //右边界
            if ((t = this.bubbles[i].x + r - this.border.right) > 0) {
                this.bubbles[i].x -= t * this.elasticity * 2;
                this.scale*=0.98;
            }
            //互相排斥
            for (var j = i + 1; j < this.bubbles.length; j++) {
                dx = this.bubbles[j].x - this.bubbles[i].x;
                dy = this.bubbles[j].y - this.bubbles[i].y;
                distance = Math.sqrt(dx * dx + dy * dy);
                if ((t = distance - r - this.bubbles[j].r*this.scale) < 0) {
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
        for(var i=0;i<this.bubbles.length;i++){
            this.ctx.fillStyle=this.bubbles[i].c;
            this.ctx.beginPath();
            this.ctx.arc(this.bubbles[i].x,this.bubbles[i].y,this.bubbles[i].r,0,Math.PI*2);
            this.cxt.closePath();
            this.cxt.fill();
        }
    }
}
