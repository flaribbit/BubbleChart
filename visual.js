d3.select("svg").append('circle')
    .attr('cx',30)
    .attr('cy',40)
    .attr('r',10)
    .style('fill', '#000000')
    .style('stroke', '#7F7F7F')
    .style('stroke-width', 1)

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
            v=new visual(data);
            for(var i=0;i<data.length;i++){
                v.addBubble(data[i]);
            }
            v.draw();
        } catch (error) {
            alert(error);
        }
    }
}

function visual(data) {
    console.log(data);
    this.bubbles = [];
    this.border = {
        top: 10,
        bottom: -10,
        left: -10,
        right: 10
    };
    this.svg=document.getElementById('_svg');
}

visual.prototype.ramdom = function (lower, upper) {
    var t = Math.random();
    return (1 - t) * lower + t * upper;
}

visual.prototype.randomColor=function(){
    var t=Math.floor(Math.random()*config.colors.length);
    return config.colors[t];
}

//添加一个气泡，位置随机，颜色随机
visual.prototype.addBubble = function (data) {
    var bubble = {
        id: data.name,
        //x: this.ramdom(this.border.left, this.border.right),
        //y: this.ramdom(this.border.bottom, this.border.top),
        x: this.ramdom(0, 1280),
        y: this.ramdom(0, 720),
        r: data.value
    };
    this.bubbles.push(bubble);
}

//删除一个气泡
visual.prototype.removeBubble = function () {

}

//更新气泡位置数据
visual.prototype.update = function () {
    
}

//绘制气泡
visual.prototype.draw = function () {
    for(var i=0;i<this.bubbles.length;i++){
        var g;
        if(g=document.getElementById(this.bubbles[i].id)){

        }else{
            g=document.createElementNS('http://www.w3.org/2000/svg','g');
            g.setAttribute('transform','translate('+this.bubbles[i].x+','+this.bubbles[i].y+')');
            var circle=document.createElementNS('http://www.w3.org/2000/svg','circle');
            circle.setAttribute('cx',0);
            circle.setAttribute('cy',0);
            circle.setAttribute('r',this.bubbles[i].r);
            circle.setAttribute('fill',this.randomColor());
            var text=document.createElementNS('http://www.w3.org/2000/svg','text');
            text.setAttribute('x',0);
            text.setAttribute('y',0);
            text.setAttribute('text-anchor','middle');
            text.innerHTML=this.bubbles[i].id;
            g.appendChild(circle);
            g.appendChild(text);
            this.svg.appendChild(g);
        }
    }
}
