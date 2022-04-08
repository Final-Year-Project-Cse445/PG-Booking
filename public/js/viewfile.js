var range=document.getElementById('rangeVal');
var txt=document.getElementById('range-txt');
range.onchange=function(){
txt.value=range.value.toString(10);
txt.innerHTML=txt.value;
}