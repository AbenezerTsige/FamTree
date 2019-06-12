// Family Tree
var Genx = 0;
var Geny = 0;
var x = 0;
var y = 0;
var yz = 135;

function setup() {

  createCanvas(2500, 2500);
}

function draw() {


  
  var xx = 1000;
  var yy = 1000;
  var zz = 135; 
  var xgen = 65;
  var ygen = 65;
 
  background(85);
  
  xx = xx + 300;
  yy = yy + 300;

  textSize(16);

  Gen17( xx , yy , xgen , ygen , yz * 8.5 , zz * 17 );

  Gen16( xx , yy , xgen , ygen , yz * 8 , zz * 16 );

  Gen15( xx , yy , xgen , ygen , yz * 7.5 , zz * 15 );

  Gen14( xx , yy , xgen , ygen , yz * 7 , zz * 14 );

  Gen13( xx , yy , xgen , ygen , yz * 6.5 , zz * 13 );

  Gen12( xx , yy , xgen , ygen , yz * 6 , zz * 12 );

  Gen11( xx , yy , xgen , ygen , yz * 5.5 , zz * 11 );
 
  Gen10( xx , yy , xgen , ygen , yz * 5 , zz * 10 );

  Gen9( xx , yy , xgen , ygen , yz * 4.5, zz * 9 );

  Gen8( xx , yy , xgen , ygen , yz * 4 , zz * 8 );

  Gen7( xx , yy , xgen , ygen , yz * 3.5, zz * 7 );

  Gen6( xx , yy , xgen * 1.5 , ygen * 1.1 , yz * 3, zz * 6 );
  
  Gen5( xx , yy , xgen , ygen , yz * 2.5, zz * 5 );

  Gen4( xx , yy , xgen , ygen , yz * 2, zz * 4 );

  Gen3( xx , yy , xgen , ygen , yz + 67, zz * 3 );

  Gen2( xx , yy , xgen , ygen , yz , zz * 2 );         // Gen 2

  Gen1( xx , yy , xgen , ygen , zz );                 // Gen 1

  Gen0( xx , yy , xgen * 1.3 , ygen * 1.1 );           // Gen 0

}

// Gen 0
function Gen0(x, y, Genx, Geny, z) {

  fill(125, 0 , 0 );
  ellipse( x, y, Genx, Geny ); 

  fill(255, 255, 255);
  text('ዮትባነኺ', x-20, y);
}

// Gen 1
function Gen1(x, y, Genx, Geny, z) {

  ellipse( x, y, Genx + z, Geny + z );
  
  fill(130, 0 , 0 );
  ellipse( x - 1 , y - 65 , Genx , Geny); 
  fill(255, 255, 255);
  text('ደሳ', x - 10 , y - 55 );

  fill(130, 0 , 0 );
  ellipse(x-57, y-30, Genx, Geny);
  fill(255, 255, 255);
  text('አክሊል', x-75, y-30);

  fill(130, 0 , 0 );
  ellipse(x-58, y+36, Genx, Geny);
  fill(255, 255, 255);
  text('ውድማጠረ', x-90, y+45);

  fill(130, 0 , 0 );
  ellipse(x, y + 67, Genx, Geny);
  fill(255, 255, 255);
  text('ጀረትማ', x-20, y+70);

  fill(130, 0 , 0 );
  ellipse( x + 58 , y + 32 , Genx, Geny);
  fill(255, 255, 255);
  text('አሽተሙኚ', x+35, y+40);

  fill(130, 0 , 0 );
  ellipse( x + 58 , y - 35 , Genx , Geny);

  fill(255, 255, 255);
  text( 'አስፎ' , x + 45 , y - 30 );
  
}

// Gen 2
function Gen2(x, y, Genx, Geny, yz, z) {

  ellipse( x, y, Genx + z , Geny + z );

  fill(135 , 0 , 0 );
  ellipse( x , y - yz , Genx , Geny );
  fill(255, 255, 255);
  text( 'አዝንፋዝ' , x - 20 , y - yz );

}

// Gen 3
function Gen3(x, y, Genx, Geny, yz, z) {

  ellipse( x, y, Genx + z , Geny + z );

  fill(140, 0 , 0 );
  ellipse(x, y - yz , Genx , Geny );

  fill(255, 255, 255);
  text('ደንበላዝ', x - 20 , y - yz );

}

// Gen 4
function Gen4(x, y, Genx, Geny, yz, z) {
  
  ellipse( x, y, Genx + z , Geny + z );

  fill(145, 0 , 0 );
  ellipse(x, y - yz , Genx, Geny);
  
  fill(255, 255, 255);
  text('ሰርፄ', x - 10, y - 275);

}

// Gen 5
function Gen5(x, y, Genx, Geny, yz, z) {
  
  ellipse( x, y, Genx + z, Geny + z );

  fill(150, 0 , 0 );
  ellipse(x, y - yz , Genx, Geny);

  fill(255, 255, 255);
  text('ተክሌ', x-10, y-340);

}

// Gen 6 
function Gen6(x, y, Genx, Geny, yz, z) {

  ellipse( x, y, Genx + z, Geny + z );

  fill(155, 0 , 0 );
  ellipse( x , y - yz , Genx + 10, Geny );

  fill(255, 255, 255);
  text( 'ራስ' , x - 10, y - yz );
  text( 'ደመክርስቶስ' , x - 30, y - (yz - 20) );

  fill(0, 200, 0);
  ellipse( x + 105 , y - (yz - 12) , Genx, Geny);
  
  fill(255, 255, 255);
  text( 'ልብሶ', x + 85, y - yz );
  
}

// Gen 7
function Gen7(x, y, Genx, Geny, yz, z) {

  ellipse( x, y, Genx + z, Geny + z );
  
  fill(160, 0 , 0 );
  ellipse( x , y - yz , Genx , Geny );

  fill(255, 255, 255);
  text('አንበሳ', x - 20 , y - yz );
  
  fill(0, 190, 0);   
  ellipse( x + 67 , y - (yz - 5) , Genx , Geny );
  
  fill(255, 255, 255);
  text( 'አባሎ' , x + 58 , y - yz );

}

// Gen 8
function Gen8(x, y, Genx, Geny, yz, z) {
  
  ellipse( x, y, Genx + z, Geny + z );

  fill(165, 0 , 0 );
  ellipse( x , y - yz , Genx , Geny );

  fill(255, 255, 255);
  text( 'መንደል' , x - 20 , y - yz );

  fill(0, 180, 0);
  ellipse( x + 67, y - yz , Genx , Geny );
  
  fill(255, 255, 255);
  text( 'ዥርገራድ' , x + 40 , y - yz );

}

// Gen 9
function Gen9(x, y, Genx, Geny, yz, z) {
  
  ellipse( x, y, Genx + z, Geny + z );

  fill(170, 0 , 0 );
  ellipse( x , y - yz , Genx + 20 , Geny );

  fill(255, 255, 255);
  text( 'ጅሩ' , x - 10 , y - yz );

  fill(0, 170, 0);
  ellipse( x + 85 , y - yz , Genx + 15, Geny );

  fill(255, 255, 255);
  text( 'ይደሮ' , x + 75, y - yz );

}

// Gen 10
function Gen10(x, y, Genx, Geny, yz, z) {

  ellipse( x, y, Genx + z, Geny + z );

  fill(175, 0 , 0 );
  ellipse( x , y - yz , Genx + 20 , Geny );

  fill(255, 255, 255);
  text( 'ዊዝር' , x - 20 , y - yz );

}

// Gen 11
function Gen11(x, y, Genx, Geny, yz, z) {

  ellipse( x, y, Genx + z, Geny + z );
  
  fill(180, 0 , 0 );
  ellipse( x , y - yz , Genx + 20 , Geny );

  fill(255, 255, 255);
  text( 'ዮጅው' , x - 20 , y - yz);

  fill(0, 160, 0);
  ellipse( x + 85 , y - yz , Genx + 20 , Geny );
  
  fill(255, 255, 255);
  text( 'የጠቀመት' , x + 60 , y - yz );

  fill(0, 0, 200);
  ellipse( x + 170 , y - yz  , Genx + 20 , Geny );

  fill(255, 255, 255);
  text( 'ያመሺ' , x + 155 , y - yz );

}

// Gen 12
function Gen12(x, y, Genx, Geny, yz, z) {

  ellipse( x, y, Genx + z, Geny + z );

  fill(185, 0, 0);
  ellipse( x , y - yz , Genx + 20 , Geny );
  
  fill(255, 255, 255);
  text( 'አቤንዥ' , x - 20 , y - yz );

  fill(0 , 150 , 0);
  ellipse( x + 85 , y - yz , Genx + 20 , Geny );

  fill(255, 255, 255);
  text( 'አበጋዝ' , x + 65 , y - yz );

  fill(0 , 0 , 190 );
  ellipse( x + 170 , y - yz , Genx + 20 , Geny );

  fill(255, 255, 255);
  text( 'ደነት' , x + 155 , y - yz );

}

// Gen 13
function Gen13(x, y, Genx, Geny, yz, z) {

  ellipse( x, y, Genx + z, Geny + z );
  
  fill(190, 0, 0);
  ellipse( x , y - yz , Genx + 20 , Geny );

  fill(255, 255, 255);
  text( 'አብደላ' , x - 20 , y - yz );

  fill(0 , 140 , 0);
  ellipse( x + 85 , y - yz , Genx + 20 , Geny );

  fill(255, 255, 255);
  text( 'ግቶ' , x + 65 , y - yz );

}

// Gen 14
function Gen14(x, y, Genx, Geny, yz, z) {

  ellipse( x, y, Genx + z, Geny + z );
  
  fill(195 , 0 , 0);
  ellipse( x , y - yz , Genx + 20 , Geny );

  fill(255, 255, 255);
  text( 'ፈይሳ' , x - 20 , y - yz );

  fill(0, 130, 0);
  ellipse( x + 85 , y - yz , Genx + 20 , Geny );

  fill(255, 255, 255);
  text( 'ቡቻ' , x + 65 , y - yz );
}

// Gen 15
function Gen15(x, y, Genx, Geny, yz, z) {

  ellipse( x, y, Genx + z, Geny + z );
  
  fill(200 , 0 , 0);
  ellipse( x , y - yz , Genx + 20 , Geny );

  fill(255, 255, 255);
  text( 'ናማጋ' , x - 20 , y - yz );

  fill(0, 120, 0);
  ellipse( x + 85 , y - yz , Genx + 20 , Geny );

  fill(255, 255, 255);
  text( 'ጨርቆሴ' , x + 65 , y - yz );

}

// Gen 16
function Gen16(x, y, Genx, Geny, yz, z) {

  ellipse( x, y, Genx + z, Geny + z );
  
  fill(205, 0, 0);
  ellipse( x , y - yz , Genx + 20 , Geny );

  fill(255, 255, 255);
  text( 'ፈለቀ' , x - 20 , y - yz );

  fill(0, 110, 0);
  ellipse( x + 85 , y - yz , Genx + 20 , Geny );
  fill(255, 255, 255);
  text( 'ነጋ' , x + 75 , y - yz );

  fill(0, 0, 180);
  ellipse( x + 170 , y - yz , Genx + 20 , Geny );
  fill(255, 255, 255);
  text( 'ፈቃደ' , x + 155 , y - yz );
 
  fill(255, 0, 255);
  ellipse( x + 255 , y - yz , Genx + 20 , Geny );
  fill(255, 255, 255);
  text( 'ጥሩነሽ' , x + 235 , y - yz );

  fill(255, 255, 0);
  ellipse( x + 335 , y - yz , Genx + 20 , Geny );

  fill(255, 255, 255);
  text( 'ሸዋደግ' , x + 320 , y - yz );
  
}

// Gen 17
function Gen17(x, y, Genx, Geny, yz, z) {

  ellipse( x, y, Genx + z, Geny + z );

  fill(255, 0, 0);
  ellipse( x , y - yz , Genx + 20 , Geny );

  fill(255, 255, 255);
  text( 'ሰርካለም' , x - 20 , y - yz );

  fill(245, 0, 0);
  ellipse( x + 85 , y - yz , Genx + 20 , Geny );

  fill(255, 255, 255);
  text( 'ታሪኩ' , x + 75 , y - yz );
  

  fill(235, 0, 0);
  ellipse( x + 170 , y - yz , Genx + 20 , Geny );

  fill(225, 255, 255);
  text( 'ሃብታሙ' , x + 155 , y - yz );
  

  fill(215, 0, 0);
  ellipse( x + 255 , y - yz , Genx + 20 , Geny );

  fill(255, 255, 255);
  text( 'አቤነዘር' , x + 235 , y - yz );

}
