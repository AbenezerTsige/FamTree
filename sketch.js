 // Family Tree
var Genx = 0;
var Geny = 0;
var x = 0;
var y = 0;

function setup() {

  createCanvas(2000, 2000);
}

function draw() {
  var xx = 600;
  var yy = 500;
  var xgen = 0;
  var ygen = 0;
  background(85);
  
  Gen8(xx, yy, xgen, ygen);
  Gen7(xx, yy, xgen, ygen);
  
 
  

  xx = xx + 300;
  yy = yy + 300;
  Gen6(xx, yy, xgen, ygen);
  Gen5(xx, yy, xgen, ygen);
  Gen4(xx, yy, xgen, ygen);
  Gen3(xx, yy, xgen, ygen);
  Gen2(xx, yy, xgen, ygen); 
  SebatBet(xx, yy, xgen, ygen); // Gen 1
  Orgins(xx, yy, xgen, ygen);   // Gen 0

}

// Gen 0
function Orgins(x, y, Genx, Geny) {

  ellipse(x, y, Genx+65, Geny+65); 
  text('ዮትባነኺ', x-20, y);
}

// Gen 1
function SebatBet(x, y, Genx, Geny) {
  
  ellipse(x, y, Genx+200, Geny+200); // 7 bet circle
  
  ellipse(x-1, y-65, Genx+65, Geny+65); 
  text('ደሳ', x-10, y-55);

  ellipse(x-57, y-30, Genx+65, Geny+65);
  text('አክሊል', x-75, y-30);

  ellipse(x-58, y+36, Genx+65, Geny+65);
  text('ውድማጠረ', x-90, y+45);

  ellipse(x, y+67, Genx+65, Geny+65);
  text('ጀረትማ', x-20, y+70);

  ellipse(x+58, y+32, Genx+65, Geny+65);
  text('አሽተሙኚ', x+35, y+40);

  ellipse(x+58, y-35, Genx+65, Geny+65);
  text('አስፎ', x+45, y-30);
  
}

// Gen 2
function Gen2(x, y, Genx, Geny) {
  ellipse(x, y, Genx+340, Geny+340);
  
  ellipse(x, y-135, Genx+65, Geny+65);
  text('አዝንፋዝ', x-20, y-135);

}

// Gen 3
function Gen3(x, y, Genx, Geny) {
  ellipse(x, y, Genx+480, Geny+480);
  
  ellipse(x, y-205, Genx+65, Geny+65);
  text('ደንበላዝ', x-20, y-205);
}

// Gen 4
function Gen4(x, y, Genx, Geny) {
  ellipse(x, y, Genx+620, Geny+620);
  
  ellipse(x, y-275, Genx+65, Geny+65);
  text('ሰርፄ', x-10, y-275);
}

// Gen 5
function Gen5(x, y, Genx, Geny) {
  ellipse(x, y, Genx+760, Geny+760);
  
  ellipse(x, y-345, Genx+65, Geny+65);
  text('ተክሌ', x-10, y-340);

}

// Gen 6 
function Gen6(x, y, Genx, Geny) {
  ellipse(x, y, Genx+900, Geny+900);
  
  ellipse(x, y-115, Genx+75, Geny+65);
  text('ራስ', x-10, y-185);
  text('ደመክርስቶስ', x-30, y-295);

  ellipse(x+78, y-292, Genx+75, Geny+65);
  text('ልብሶ', x+60, y-295);
  
}

// Gen 7
function Gen7(x, y, Genx, Geny) {
  ellipse(x+300, y+300, Genx+1040, Geny+1040);
  
  ellipse(x+300, y-185, Genx+85, Geny+65);
  text('አንበሳ', x+280, y-185);

  ellipse(x+382, y-180, Genx+75, Geny+65);
  text('አባሎ', x+365, y-185);

}

// Gen 8
function Gen8(x, y, Genx, Geny) {
  ellipse(x+300, y+300, Genx+1180, Geny+1180);
  
  ellipse(x+300, y-255, Genx+95, Geny+65);
  text('መንደል', x+280, y-255);

  ellipse(x+400, y-255, Genx+75, Geny+65);
  text('ዥርገራድ', x+380, y-255);

  



}
