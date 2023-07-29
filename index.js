document.addEventListener('DOMContentLoaded', function () {
    var dataButton = document.querySelector('.data_button');
    var configButton = document.querySelector('.config_button');
    var dataSidebar = document.querySelector('.data_sidebar');
    var configSidebar = document.querySelector('.config_sidebar');
    dataSidebar.style.display = 'block';
    configSidebar.style.display = 'none';
    dataButton.addEventListener('click', function () {
        dataSidebar.style.display = 'block';
        configSidebar.style.display = 'none';
    });
    configButton.addEventListener('click', function () {
        dataSidebar.style.display = 'none';
        configSidebar.style.display = 'block';
    });

    var aside_title_list = document.getElementsByClassName("aside_title"); // getElementsByClassName返回的NodeList没有foreach方法,需要手动转换为数组
    aside_title_list = [].slice.call(aside_title_list);
    aside_title_list.forEach((element) => {
        element.addEventListener("click", () => {
            var arrow = element.children[0];    /* 箭头旋转 */
            arrow.classList.toggle("list_arrow_fold");

            var detail_node = element.parentNode.getElementsByClassName("aside_detail")[0];
            detail_node.classList.toggle("aside_detail_fold");
        });
    });
});

// 初始化绘图数据
var rawdata = [{
    year: 2019,
    yield: 2
},
{
    year: 2020,
    yield: 3
},
{
    year: 2021,
    yield: 5
}
];

var data = [{
    year: 2019,
    yield: 2
},
{
    year: 2020,
    yield: 3
},
{
    year: 2021,
    yield: 5
}
];

// 可配置项
var config = {
    barColor1: '#5B8FF9', // 柱状图填充颜色1
    barColor2: '#5B8FF9', // 柱状图填充颜色2
    barGradient: 0, // 是否启用柱状图渐变填充
    barPattern: 'solid', // 填充样式
    lineColor: '#5AD8A6', // 折线图线的颜色
    // lineWidth: 1, // 折线图线的粗细
    lineWidth: 3,
    lineStyle: 'solid', // 折线样式
    pointShape: 'triangle', // 折线图上数据点的形状
    pointColor: '#5AD8A6', // 折线图上数据点的颜色
    // pointSize: 5, // 折线图上数据点的大小
    pointSize: 15,
    font: 'Arial', // 文字字体
    // fontSize: '14px', // 文字字号
    fontSize: '42px',
    fontColor: 'black', // 文字颜色
    barInvisible: false, // 柱状图隐藏
    lineInvisible: false // 条形图隐藏
};

//event listeners
document.addEventListener('DOMContentLoaded', function () {
    var txtButton = document.getElementById('txt_button');
    txtButton.addEventListener('click', handleFileSelect);

    function handleFileSelect(event) {
        var fileInput = document.createElement('input');
        fileInput.type = 'file';

        fileInput.addEventListener('change', function (event) {
            var file = event.target.files[0];
            var reader = new FileReader();

            reader.onload = function (event) {
                var fileContent = event.target.result;
                var parsedString = parseFileContent(fileContent);
                var text_input_node = document.getElementById('data_input');

                var arr = [];
                var regex = /\(\s*(\d+)\s*,\s*(\d+(.\d+)?)\s*\)/g;//e.g. matches "(111, 222 )"
                (text_input_node.value + parsedString).replace(regex, function (match, year, yield) {
                    // year and yield gets their val from corresponding capture groups
                    var obj = {
                        year: Number(year),
                        yield: Number(yield)
                    };
                    // push into arr
                    arr.push(obj);
                });
                var tmpdata;
                var flag = true;
                tmpdata = QSort(arr);
                for (var i = 0; i < tmpdata.length - 1; i++) {
                    if (tmpdata[i].year === tmpdata[i + 1].year) {
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    text_input_node.value += parsedString;
                    rawdata = tmpdata;
                    data = tmpdata;
                    var canvas = document.getElementById('chartCanvas');
                    canvas.height = 1500;
                    canvas.width = 2400;
                    canvas.style.height = 500 + "px";
                    canvas.style.width = 800 + "px";
                    drawChart(true);
                    
                }
                else {
                    alert("年份冲突");
                }
            };

            reader.readAsText(file);
        });

        fileInput.click();
    }

    function parseFileContent(fileContent) {
        return fileContent;
    }
});

window.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('chartCanvas');
    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    const handleMouseDown = function (event) {
        isResizing = true;
        startX = event.clientX;
        startY = event.clientY;
        startWidth = canvas.offsetWidth;
        startHeight = canvas.offsetHeight;
        event.preventDefault();
    };

    const handleMouseMove = function (event) {
        if (!isResizing) {
            return;
        }

        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;

        let newWidth = startWidth + 2 * deltaX;
        let newHeight = startHeight + 2 * deltaY;

        // 限制最小值
        newWidth = Math.max(167, newWidth);
        newHeight = Math.max(103, newHeight);

        canvas.width = newWidth * 3;
        canvas.height = newHeight * 3;
        canvas.style.width = newWidth + 'px';
        canvas.style.height = newHeight + 'px';

        // 重新绘制画布内容，在这里调用相应的函数
        drawChart(false);

    };

    const handleMouseUp = function (event) {
        isResizing = false;
    };
    const handleMouseWheel = function (event) {
        let scale = 1;
        const delta = Math.max(-1, Math.min(1, (event.deltaY || -event.detail)));
        if (event.ctrlKey) {
            event.preventDefault();

            const scaleFactor = 0.1; // 缩放比例
            if (delta < 0) {
                scale += scaleFactor;
            } else {
                scale -= scaleFactor;
            }
            let newWidth = canvas.offsetWidth;
            let newHeight = canvas.offsetHeight;
            if (newWidth !== 167 || delta < 0) {
                newWidth = canvas.offsetWidth * scale;
                newHeight = canvas.offsetHeight * scale;
                newWidth = Math.max(167, newWidth);
                newHeight = Math.max(167 * canvas.offsetHeight / canvas.offsetWidth, newHeight);
            }
            // 缩放画布
            canvas.width = newWidth * 3;
            canvas.height = newHeight * 3;
            canvas.style.width = newWidth + 'px';
            canvas.style.height = newHeight + 'px';
            drawChart(false);

        }
    };
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener("mousewheel", handleMouseWheel);
    canvas.addEventListener("DOMMouseScroll", handleMouseWheel);
});


var bar_color1 = document.getElementById('bar_color1');
bar_color1.addEventListener('input', function (event) {
    var inputValue = event.target.value;
    config.barColor1 = inputValue;
    drawChart(false);
})

var bar_color2 = document.getElementById('bar_color2');
bar_color2.addEventListener('input', function (event) {
    var inputValue = event.target.value;
    config.barColor2 = inputValue;
    drawChart(false);
})


var bar_gradient = document.getElementById('bar_gradient');
bar_gradient.addEventListener('input', function (event) {
    var inputValue = event.target.value;
    config.barGradient = inputValue;
    drawChart(false);
})

var bar_pattern = document.getElementById('bar_pattern');
bar_pattern.addEventListener('input', function (event) {
    var inputValue = event.target.value;
    config.barPattern = inputValue;
    drawChart(true);
});

var line_color = document.getElementById('line_color');
line_color.addEventListener('input', function (event) {
    var inputValue = event.target.value;
    config.lineColor = inputValue;
    drawChart(false);
})

var line_width = document.getElementById('line_width');
line_width.addEventListener('input', function (event) {
    var inputValue = event.target.value;
    config.lineWidth = inputValue * 3;
    drawChart(false);
})

var line_style = document.getElementById('line_style');
line_style.addEventListener('input', function (event) {
    var inputValue = event.target.value;
    config.lineStyle = inputValue;
    drawChart(false);
})

var line_point_shape_style = document.getElementById('line_point_shape_style');
line_point_shape_style.addEventListener('input', function (event) {
    var inputValue = event.target.value;
    config.pointShape = inputValue;
    drawChart(false);
})

var line_point_color = document.getElementById('line_point_color');
line_point_color.addEventListener('input', function (event) {
    var inputValue = event.target.value;
    config.pointColor = inputValue;
    drawChart(false);
})

var line_point_size = document.getElementById('line_point_size');
line_point_size.addEventListener('input', function (event) {
    var inputValue = event.target.value;
    config.pointSize = inputValue * 3;
    drawChart(false);
})

var text_font = document.getElementById('text_font');
text_font.addEventListener('input', function (event) {
    var inputValue = event.target.value;
    config.font = inputValue;
    drawChart(false);
})

var text_size = document.getElementById('text_size');
text_size.addEventListener('input', function (event) {
    var inputValue = event.target.value;
    config.fontSize = inputValue * 3 + 'px';
    drawChart(false);
})

var text_color = document.getElementById('text_color');
text_color.addEventListener('input', function (event) {
    var inputValue = event.target.value;
    config.fontColor = inputValue;
    drawChart(false);
})

var bar_chart_invisibility = document.getElementById('bar_chart_invisibility');
bar_chart_invisibility.addEventListener('input', function (event) {
    var inputValue = event.target.checked;
    config.barInvisible = inputValue;
    drawChart(false);
})

var line_chart_invisibility = document.getElementById('line_chart_invisibility');
line_chart_invisibility.addEventListener('input', function (event) {
    var inputValue = event.target.checked;
    config.lineInvisible = inputValue;
    drawChart(false);
})

function barOverflowLimit(limitDiff, LeastDiff) {
    //limitDiff 指的是最高差几倍时就会溢出
    if (data.length === 1) {
        return { maxValue: data[0].yield, minValue: 0 };
    }
    var min = -1;
    var max = 1;
    for (var i = 0; i < data.length; ++i) {
        var y = data[i].yield;
        max = y > max ? y : max;
        if (y === 0) {
            continue;
        }
        if (min === -1) {
            min = y;
        }
        else {
            min = y < min ? y : min;
        }
    }
    if (max === min) {
        return {maxValue: max, minValue: 0};
    }
    return {
        maxValue: (max / min > 10 ? limitDiff * min : max), minValue: (max / min < 1.5 ? min - (max - min) / (LeastDiff - 1) : 0),
        overflow: (max / min > 10 ? true : false), underflow: (max / min < 1.5 ? true : false)
    };
}

// 绘制图表

var drawChartFrameCnt = 20
var animationDuration = 500;
function drawChartSingleFrame(frame, maxValue, minValue, sumValue, animation) {
    if (animation === false) {
        frame = drawChartFrameCnt;
    }
    var canvas = document.getElementById('chartCanvas');
    var ctx = canvas.getContext('2d');
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    // 清空画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // 绘制坐标轴
    drawAxis();
    if (config.barInvisible === false) {
        // 绘制柱状图
        drawBarChart(maxValue * drawChartFrameCnt / frame, minValue);
    }
    if (config.lineInvisible === false) {
        // 绘制折线图
        drawLineChart(maxValue * drawChartFrameCnt / frame, minValue);
    }
    // 添加年份标签
    drawYearLabels();
    // 添加数据点标签
    drawDataPointLabels(maxValue * drawChartFrameCnt / frame, minValue, sumValue, frame);
    ++frame;
    if (frame <= drawChartFrameCnt) {
        setTimeout(drawChartSingleFrame, animationDuration / drawChartFrameCnt, frame, maxValue, minValue, sumValue, animation);
    }
}

function drawChart(animation) {
    var limitDiff = 10; // 最小于最大之间最多差这么多倍, 超过即溢出.
    var LeastDiff = 1.5; // 最少差这么多倍数(严格大于1！！！)， 否则去尾
    var ans = barOverflowLimit(limitDiff, LeastDiff);
    var maxValue = ans.maxValue;// 如果未超出10倍为最大值，否则为非0最小值的10倍
    var minValue = ans.minValue;// 其它非0值下降的值
    var sumValue = data.reduce((accumulator, currentValue) => accumulator + currentValue.yield, 0);
    drawChartSingleFrame(1, maxValue, minValue, sumValue, animation);
}

// 绘制坐标轴
function drawAxis() {
    const canvas = document.getElementById('chartCanvas');
    var ctx = canvas.getContext('2d');
    ctx.setLineDash([]);//solid
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const axisColor = "#8e8e8e";
    const axisWidth = 5;
    const tickLength = 5;

    // 绘制 x 轴
    ctx.beginPath();
    ctx.moveTo(canvasWidth * 0.1, canvasHeight * 0.9);
    ctx.lineTo(canvasWidth * 0.9, canvasHeight * 0.9);
    ctx.lineTo(canvasWidth * 0.9 - 10, canvasHeight * 0.9 - 6);
    ctx.moveTo(canvasWidth * 0.9, canvasHeight * 0.9);
    ctx.lineTo(canvasWidth * 0.9 - 10, canvasHeight * 0.9 + 6);
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = axisWidth;
    ctx.stroke();

    // 绘制 y 轴
    ctx.beginPath();
    ctx.moveTo(canvasWidth * 0.1, canvasHeight * 0.9);
    ctx.lineTo(canvasWidth * 0.1, canvasHeight * 0.1);
    ctx.lineTo(canvasWidth * 0.1 - 6, canvasHeight * 0.1 + 10);
    ctx.moveTo(canvasWidth * 0.1, canvasHeight * 0.1);
    ctx.lineTo(canvasWidth * 0.1 + 6, canvasHeight * 0.1 + 10);
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = axisWidth;
    ctx.stroke();


}

//绘制柱状图
function drawBarChart(maxValue, minValue) {
    const canvas = document.getElementById('chartCanvas');
    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const barSpacing = (canvasWidth * 0.8) / data.length;
    const barWidth = barSpacing * 0.5;
    const dashHeight = 0.01 * canvasHeight;
    const backgroundColor = "#ffffff";
    for (let i = 0; i < data.length; i++) {
        const x = canvasWidth * 0.1 + barSpacing * (i + 0.5);
        const barHeight = (canvasHeight * 0.8) / (maxValue - minValue) * (data[i].yield > maxValue ? maxValue : (data[i].yield === 0 ? 0 : data[i].yield - minValue)) * 0.8;
        var hexColor = config.barColor1.replace('#', '');
        var red = parseInt(hexColor.substring(0, 2), 16);
        var green = parseInt(hexColor.substring(2, 4), 16);
        var blue = parseInt(hexColor.substring(4, 6), 16);
        var gradient = ctx.createLinearGradient(x, canvasHeight * 0.9, x, canvasHeight * 0.9 - barHeight);//a Canvas Gradient obj
        gradient.addColorStop(0, config.barColor1);
        var color2 = config.barColor2;
        var hexColor2 = color2.replace('#', '');
        var red2 = parseInt(hexColor2.substring(0, 2), 16);
        var green2 = parseInt(hexColor2.substring(2, 4), 16);
        var blue2 = parseInt(hexColor2.substring(4, 6), 16);
        var beta = 0.5 * Math.sin(config.barGradient / 100 * Math.PI - Math.PI * 0.5) + 0.5;
        var alpha = 1 - beta;
        var newRed = red * alpha + red2 * beta;
        var newGreen = green * alpha + green2 * beta;
        var newBlue = blue * alpha + blue2 * beta;
        gradient.addColorStop(1 - config.barGradient / 100, `rgb(${newRed},${newGreen},${newBlue})`);
        gradient.addColorStop(1, color2);
        var barPattern;
        barPattern = gradient;
        ctx.fillStyle = barPattern;
        ctx.fillRect(x - barWidth / 2, canvasHeight * 0.9 - barHeight, barWidth, barHeight);
        if (config.barPattern === "shadow") {
            ctx.fillStyle = 'white';
            for (var j = 2; j < barWidth - 5; j += 6) {
                for (var k = 2; k < barHeight - 5; k += 6) {
                    if (((j + k - 4) % 12 === 0)) {
                        if (j > barWidth - 7) {
                            ctx.fillRect(Math.floor(x - barWidth / 2 + j), Math.floor(canvasHeight * 0.9 - barHeight + k), 3, 6);
                        }
                        else if (k > barHeight - 7) {
                            ctx.fillRect(Math.floor(x - barWidth / 2 + j), Math.floor(canvasHeight * 0.9 - barHeight + k), 6, 3);
                        }
                        else {
                            ctx.fillRect(Math.floor(x - barWidth / 2 + j), Math.floor(canvasHeight * 0.9 - barHeight + k), 6, 6);
                        }
                    }
                }
            }
        }
        else if (config.barPattern === "diagonal") {
            ctx.fillStyle = 'white';
            for (var j = 2; j < barWidth - 7; j += 6) {
                for (var k = 2; k < barHeight - 7; k += 6) {
                    if ((j + k - 4) % 36 !== 0) {
                        ctx.fillRect(Math.floor(x - barWidth / 2 + j), Math.floor(canvasHeight * 0.9 - barHeight + k), 6, 6);
                    }
                }
            }
        }
        if (data[i].yield > maxValue) {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(x - barWidth / 2, canvasHeight * 0.9 - barHeight + dashHeight, barWidth, dashHeight);
            ctx.fillRect(x - barWidth / 2, canvasHeight * 0.9 - barHeight + 3 * dashHeight, barWidth, dashHeight);
        }
        if (minValue !== 0 && data[i].yield !== 0) {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(x - barWidth / 2, canvasHeight * 0.9 - 2 * dashHeight, barWidth, dashHeight);
            ctx.fillRect(x - barWidth / 2, canvasHeight * 0.9 - 4 * dashHeight, barWidth, dashHeight);
        }
    }
}

// 绘制折线图
function drawLineChart(maxValue, minValue) {
    const canvas = document.getElementById('chartCanvas');
    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const lineSpacing = (canvasWidth * 0.8) / data.length;
    ctx.strokeStyle = config.lineColor;
    ctx.lineWidth = config.lineWidth;
    var linePattern;
    if (config.lineStyle === "solid") {
        linePattern = [];
    }
    else if (config.lineStyle === "dashed") {
        linePattern = [10, 10];
    }
    else if (config.lineStyle === "dotted") {
        linePattern = [10, 9, 1, 9];
    }
    ctx.setLineDash(linePattern);
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
        const x = canvasWidth * 0.1 + lineSpacing * (i + 0.5);
        const lineY = canvasHeight * 0.9 - (canvasHeight * 0.8) / (maxValue - minValue) * (data[i].yield > maxValue ? maxValue : (data[i].yield === 0 ? 0 : data[i].yield - minValue));
        if (i === 0) {
            ctx.moveTo(x, lineY);
        } else {
            ctx.lineTo(x, lineY);
        }
    }
    ctx.stroke();
    for (let i = 0; i < data.length; i++) {
        const x = canvasWidth * 0.1 + lineSpacing * (i + 0.5);
        const lineY = canvasHeight * 0.9 - (canvasHeight * 0.8) / (maxValue - minValue) * (data[i].yield > maxValue ? maxValue : (data[i].yield === 0 ? 0 : data[i].yield - minValue));
        // 绘制数据点
        drawDataPoint(x, lineY);
    }
}

// 绘制数据点
function drawDataPoint(x, y) {
    const canvas = document.getElementById('chartCanvas');
    const ctx = canvas.getContext('2d');
    const pointRadius = config.pointSize;
    if (config.pointShape === 'circle') {
        ctx.beginPath();
        ctx.arc(x, y, pointRadius, 0, 2 * Math.PI);
        ctx.fillStyle = config.pointColor;
        ctx.fill();
    } else if (config.pointShape === 'square') {
        ctx.fillStyle = config.pointColor;
        ctx.fillRect(x - pointRadius, y - pointRadius, pointRadius * 2, pointRadius * 2);
    }
    else if (config.pointShape === 'triangle') {
        ctx.fillStyle = config.pointColor;
        ctx.beginPath();
        ctx.moveTo(x, y - pointRadius * 2 / 1.5);
        ctx.lineTo(x + pointRadius * Math.sqrt(3) / 1.5, y + pointRadius / 1.5);
        ctx.lineTo(x - pointRadius * Math.sqrt(3) / 1.5, y + pointRadius / 1.5);
        ctx.lineTo(x, y - pointRadius * 2 / 1.5);
        ctx.fill();
    }
    ctx.moveTo(x, y);
}

// 添加年份和产量标签
function drawYearLabels() {
    var canvas = document.getElementById('chartCanvas');
    var ctx = canvas.getContext('2d');
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    ctx.font = `${config.fontSize} ${config.font}`;
    ctx.fillStyle = config.fontColor;
    for (let i = 0; i < data.length;) {
        var x = canvasWidth * 0.1 + (canvasWidth * 0.8) / (data.length) * (i + 0.5);
        var label = data[i].year;
        var textWidth = ctx.measureText(label).width;
        ctx.save();
        ctx.translate(x + textWidth / 2, canvasHeight * 0.95);
        ctx.textAlign = 'right';
        ctx.fillText(label, 0, 0);
        ctx.restore();
        i += Math.floor((data.length / 20) * 2400 / canvasWidth) + 1;
        if ((i > data.length - 1) && (i < data.length + Math.floor((data.length / 20) * 2400 / canvasWidth))) {
            i = data.length - 1;
        }
    }
    ctx.save();
    ctx.translate(canvasWidth * 0.91 + 24, canvasHeight * 0.95);
    ctx.textAlign = 'left';
    ctx.fillText('年份', 0, 0);
    ctx.restore();
    ctx.save();
    ctx.translate(canvasWidth * 0.09 - 24, canvasHeight * 0.05);
    ctx.textAlign = 'right';
    var text = '产量';
    ctx.fillText(text, 0, 0);
    ctx.restore();
    ctx.save();
    var textHeight = ctx.measureText(text).width;
    ctx.translate(canvasWidth * 0.09 - 24, canvasHeight * 0.05 + textHeight * 0.6);
    ctx.textAlign = 'right';
    ctx.fillText('(万吨)', 0, 0);
    ctx.restore();
    var limitDiff = 10; // 最小于最大之间最多差这么多倍, 超过即溢出.
    var LeastDiff = 1.5; // 最少差这么多倍数(严格大于1！！！)， 否则去尾
    var ans = barOverflowLimit(limitDiff, LeastDiff);
    var maxValue = ans.maxValue;
    var minValue = ans.minValue;
    if (ans.overflow) {
        for (var i = 1; i < 5; i++) {
            ctx.save();
            ctx.translate(canvasWidth * 0.1 - 24, canvasHeight * (0.9 - i * 0.128) + 0.5 * parseInt(config.fontSize, 10));
            ctx.textAlign = 'right';
            var text = Number((maxValue / 5 * i).toFixed(2));
            ctx.fillText(text, 0, 0);
            ctx.restore();
        }
        ctx.save();
        ctx.translate(canvasWidth * 0.1 - 24, canvasHeight * 0.26 + 0.5 * parseInt(config.fontSize, 10));
        ctx.textAlign = 'right';
        ctx.fillText('过大', 0, 0);
        ctx.restore();
    }
    else if (ans.underflow) {
        for (var i = 1; i < 7; i++) {
            ctx.save();
            ctx.translate(canvasWidth * 0.1 - 24, canvasHeight * (0.9 - i * 0.128) + 0.5 * parseInt(config.fontSize, 10));
            ctx.textAlign = 'right';
            var text = Number(((maxValue - minValue) / 5 * i + minValue).toFixed(2));
            ctx.fillText(text, 0, 0);
            ctx.restore();
        }
    }
    else {
        for (var i = 1; i < 7; i++) {
            ctx.save();
            ctx.translate(canvasWidth * 0.1 - 24, canvasHeight * (0.9 - i * 0.128) + 0.5 * parseInt(config.fontSize, 10));
            ctx.textAlign = 'right';
            var text = Number((maxValue / 5 * i).toFixed(2));
            ctx.fillText(text, 0, 0);
            ctx.restore();
        }
    }
}

// 添加数据点标签
function drawDataPointLabels(maxValue, minValue, sumValue, frame) {
    sumValue = sumValue === 0 ? 1: sumValue;
    const canvas = document.getElementById('chartCanvas');
    const ctx = canvas.getContext('2d');
    const canvasHeight = canvas.height;
    const canvasWidth = canvas.width;
    for (let i = 0; i < data.length;) {
        const x = canvas.width * 0.1 + (canvas.width * 0.8) / (data.length) * (i + 0.5);
        const y = canvasHeight * 0.9 - (canvasHeight * 0.8) / (maxValue - minValue) * (data[i].yield > maxValue ? maxValue : (data[i].yield === 0 ? 0 : data[i].yield - minValue));
        // const y = canvasHeight * 0.9 - (canvasHeight * 0.8) / maxValue * (data[i].yield > maxValue ? maxValue : data[i].yield);
        const label = `${((data[i].yield / sumValue) * 100).toFixed(2)}%`;
        ctx.font = `${config.fontSize} ${config.font}`;
        ctx.fillStyle = config.fontColor;
        ctx.textAlign = 'center';
        if (config.barInvisible === false) {
            if ((((canvasHeight * 0.8 * (frame / drawChartFrameCnt) / (canvasHeight * 0.9 - y) > 2.51) && (!config.lineInvisible))) || ((canvasHeight * 0.9 - y) < (350 * (frame / drawChartFrameCnt)))) {//与最高大小的差值大于2.5倍
                ctx.fillText(data[i].yield, x + (canvas.width * 0.8) / (data.length) * 0.25, y + (canvasHeight * 0.9 - y) * 0.1);
            }
            else {
                ctx.fillText(data[i].yield, x, y + (canvasHeight * 0.9 - y) * 0.2 - 30);
            }
        }
        if (config.lineInvisible === false) {
            ctx.fillText(label, x, y - 30);
        }
        i += Math.floor((data.length / 20) * 2400 / canvasWidth) + 1;
        if ((i > data.length - 1) && (i < data.length + Math.floor((data.length / 20) * 2400 / canvasWidth))) {
            i = data.length - 1;
        }
    }
}

// 添加数据
function QSort(arr) {
    if (arr.length <= 1) {
        // no need to sort
        return arr;
    }
    var pivot = arr[Math.floor(arr.length / 2)];
    var left = [];
    var right = [];
    for (var i = 0; i < arr.length; i++) {
        if (i === Math.floor(arr.length / 2)) {
            continue;
        }
        if (arr[i].year < pivot.year) {
            left.push(arr[i]);
        }
        else {
            right.push(arr[i]);
        }
    }
    // recursion
    return QSort(left).concat([pivot], QSort(right));
}

function addData() {
    var input = document.getElementById('data_input').value;
    var arr = [];
    var regex = /\(\s*(\d+)\s*,\s*(\d+(.\d+)?)\s*\)/g;
    input.replace(regex, function (match, year, yield) {
        var obj = {
            year: Number(year),
            yield: Number(yield)
        };
        // push into arr
        arr.push(obj);
    });
    var tmpdata;
    var flag = true;
    tmpdata = QSort(arr);
    for (var i = 0; i < tmpdata.length - 1; i++) {
        if (tmpdata[i].year === tmpdata[i + 1].year) {
            flag = false;
            break;
        }
    }
    if (flag) {
        rawdata = tmpdata;
        data = tmpdata;
        var canvas = document.getElementById('chartCanvas');
        canvas.height = 1500;
        canvas.width = 2400;
        canvas.style.height = 500 + "px";
        canvas.style.width = 800 + "px";
        drawChart(true);
    }
    else {
        alert("年份冲突");
    }

}

function filterData() {
    var year_range = [];
    var yield_range = [];
    var year_range_input = document.getElementById('year_retain').value;
    var yield_range_input = document.getElementById('yield_retain').value;
    var regex = /\[\s*(\d+(.\d+)?)\s*,\s*(\d+(.\d+)?)\s*\]/g;
    year_range_input.replace(regex, function (match, year1, useless_year, year2) {
        var obj = {
            year1: Number(year1),
            year2: Number(year2)
        };
        // push into arr
        year_range.push(obj);
    });
    yield_range_input.replace(regex, function (match, yield1, useless_yield, yield2) {
        var obj = {
            yield1: Number(yield1),
            yield2: Number(yield2)
        };
        // push into arr
        yield_range.push(obj);
    });
    var filtered_data1 = [];
    var filtered_data2 = [];
    if (year_range.length !== 0 && yield_range.length !== 0) {
        for (var i = 0; i < year_range.length; i++) {
            for (var j = 0; j < rawdata.length; j++) {
                if (rawdata[j].year >= year_range[i].year1 && rawdata[j].year <= year_range[i].year2) {
                    filtered_data1.push(rawdata[j]);
                }
            }
        }
        for (var i = 0; i < yield_range.length; i++) {
            for (var j = 0; j < filtered_data1.length; j++) {
                if (filtered_data1[j].yield >= yield_range[i].yield1 && filtered_data1[j].yield <= yield_range[i].yield2) {
                    filtered_data2.push(filtered_data1[j]);
                }
            }
        }

    }
    else if (year_range.length === 0 && yield_range.length !== 0) {
        filtered_data1 = rawdata;
        for (var i = 0; i < yield_range.length; i++) {
            for (var j = 0; j < filtered_data1.length; j++) {
                if (filtered_data1[j].yield >= yield_range[i].yield1 && filtered_data1[j].yield <= yield_range[i].yield2) {
                    filtered_data2.push(filtered_data1[j]);
                }
            }
        }
    }
    else if (year_range.length !== 0 && yield_range.length === 0) {
        for (var i = 0; i < year_range.length; i++) {
            for (var j = 0; j < rawdata.length; j++) {
                if (rawdata[j].year >= year_range[i].year1 && rawdata[j].year <= year_range[i].year2) {
                    filtered_data1.push(rawdata[j]);
                }
            }
        }
        filtered_data2 = filtered_data1;
    }
    else if (year_range.length === 0 && yield_range.length === 0) {
        filtered_data1 = rawdata;
        filtered_data2 = filtered_data1;
    }
    var tmpdata = QSort(filtered_data2);
    var transdata = [];
    for (var i = 0; i < tmpdata.length; i++) {
        if (i === 0) {
            transdata.push(tmpdata[i]);
        }
        else {
            if (tmpdata[i].year !== tmpdata[i - 1].year) {
                transdata.push(tmpdata[i]);
            }
        }
    }
    data = transdata;
    var canvas = document.getElementById('chartCanvas');
    canvas.height = 1500;
    canvas.width = 2400;
    canvas.style.height = 500 + "px";
    canvas.style.width = 800 + "px";
    drawChart(true);
}

// 初始化页面
drawChart(true);

// 监听窗口大小变化，重新绘制图表
window.addEventListener('resize', drawChart(false));