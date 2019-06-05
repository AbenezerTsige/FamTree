// Family Tree
var Genx = 0;
var Geny = 0;
var x = 0;
var y = 0;
 var z = 135;

function setup() {

  createCanvas(2000, 2000);
}

function draw() {
  
  var xx = 600;
  var yy = 500;
  var xgen = 65;
  var ygen = 65;
 

  background(85);
  
  xx = xx + 300;
  yy = yy + 300;

  
  ellipse( xx, yy, xgen + ( z * 9) , ygen + ( z * 9 ) );
  Gen9(xx, yy, xgen, ygen);

  ellipse( xx, yy, xgen + ( z * 8) , ygen + ( z * 8 ) );
  Gen8(xx, yy, xgen, ygen);
   
  ellipse( xx, yy, xgen + ( z * 7) , ygen + ( z * 7 ) );
  Gen7(xx, yy, xgen, ygen);
  
  ellipse( xx, yy, xgen + ( z * 6) , ygen + ( z * 6 ) );
  Gen6(xx, yy, xgen, ygen);

  ellipse( xx, yy, xgen + ( z * 5) , ygen + ( z * 5 ) );
  Gen5(xx, yy, xgen, ygen);
  
  ellipse( xx, yy, xgen + ( z * 4) , ygen + ( z * 4 ) );
  Gen4( xx, yy, xgen, ygen );

  ellipse( xx, yy, xgen + ( z * 3 ), ygen + ( z * 3 ) );
  Gen3( xx, yy, xgen, ygen );

  ellipse( xx, yy, xgen + ( z * 2 ), ygen + ( z * 2 ) );
  Gen2( xx, yy, xgen, ygen ); 

  ellipse( xx, yy, xgen + z, ygen + z ); // 7 bet circle
  Gen1( xx, yy, xgen, ygen ); // Gen 1
  
  ellipse( xx, yy, xgen, ygen ); 
  Gen0( xx, yy, xgen, ygen );   // Gen 0

}

// Gen 0
function Gen0(x, y, Genx, Geny) {
  
  text('ዮትባነኺ', x-20, y);
}

// Gen 1
function Gen1(x, y, Genx, Geny) {
  
  ellipse(x-1, y-65, Genx, Geny); 
  text('ደሳ', x-10, y-55);

  ellipse(x-57, y-30, Genx, Geny);
  text('አክሊል', x-75, y-30);

  ellipse(x-58, y+36, Genx, Geny);
  text('ውድማጠረ', x-90, y+45);

  ellipse(x, y+67, Genx, Geny);
  text('ጀረትማ', x-20, y+70);

  ellipse(x+58, y+32, Genx, Geny);
  text('አሽተሙኚ', x+35, y+40);

  ellipse(x+58, y-35, Genx, Geny);
  text('አስፎ', x+45, y-30);
  
}

// Gen 2
function Gen2(x, y, Genx, Geny) {
  
  ellipse( x , y - z , Genx , Geny );
  text( 'አዝንፋዝ' , x - 20 , y - z );

}

// Gen 3
function Gen3(x, y, Genx, Geny) {
  
  ellipse(x, y - ( z + 67 ) , Genx , Geny );
  text('ደንበላዝ', x - 20 , y - (z + 67) );
}

// Gen 4
function Gen4(x, y, Genx, Geny) {
  
  ellipse(x, y - ( z * 2), Genx, Geny);
  text('ሰርፄ', x-10, y-275);
}

// Gen 5
function Gen5(x, y, Genx, Geny) {
  
  ellipse(x, y - ( z * 2.5 ), Genx, Geny);
  text('ተክሌ', x-10, y-340);

}

// Gen 6 
function Gen6(x, y, Genx, Geny) {
  
  ellipse( x, y - ( z * 3) , Genx + 10, Geny );
  text( 'ራስ' , x - 10, y - ( z * 3.1 ) );
  text( 'ደመክርስቶስ' , x - 30, y - ( z * 2.93 ) );

  ellipse( x + 73, y - ( z * 2.95 ), Genx, Geny);
  text( 'ልብሶ', x + 60, y - ( z * 2.93) );
  
}

// Gen 7
function Gen7(x, y, Genx, Geny) {
  
  ellipse( x , y - ( z * 3.5 ) , Genx , Geny );
  text('አንበሳ', x - 20 , y - ( z * 3.5 ) );

  ellipse( x + 67 , y - ( z * 3.45 ) , Genx , Geny );
  text( 'አባሎ' , x + 58 , y - ( z * 3.5 ) );

}

// Gen 8
function Gen8(x, y, Genx, Geny) {
  
  ellipse( x , y - ( z * 4) , Genx , Geny );
  text( 'መንደል' , x - 20 , y - ( z * 4) );

  ellipse( x + 67, y - ( z * 3.97) , Genx , Geny );
  text( 'ዥርገራድ' , x + 40 , y - ( z * 4) );

}

// Gen 9
function Gen9(x, y, Genx, Geny) {
  
  ellipse( x , y - ( z * 4.5 ) , Genx + 20 , Geny );
  text( 'መንደል' , x - 20 , y - 45);

  ellipse( x + 85 , y - ( z * 4.45 ), Genx + 15, Geny );
  text( 'ዥርገራድ' , x + 80, y - 45);
}
