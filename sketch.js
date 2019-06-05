// Family Tree
var Genx = 0;
var Geny = 0;
var x = 600;
var y = 500;

function setup() {

	createCanvas(1200, 1000);
}

function draw() {
	
	background(85);

	Gen5();
	Gen4();
	Gen3();
	Gen2(); 
	SebatBet(); // Gen 1
	Orgins();  	// Gen 0

}

// Gen 0
function Orgins() {

	ellipse(x+300, y+300, Genx+65, Geny+65); 
	text('ዮትባነኺ', x+280, y+300);
}

// Gen 1
function SebatBet()	{

	ellipse(x+300, y+300, Genx+200, Geny+200); // 7 bet circle
	
	ellipse(x+299, y+235, Genx+65, Geny+65); 
	text('ደሳ', x+290, y+235);

	ellipse(x+243, y+270, Genx+65, Geny+65);
	text('አክሊል', x+225, y+270);

	ellipse(x+242, y+336, Genx+65, Geny+65);
	text('ውድማጠረ', x+210, y+345);

	ellipse(x+300, y+367, Genx+65, Geny+65);
	text('ጀረትማ', x+280, y+370);

	ellipse(x+358, y+332, Genx+65, Geny+65);
	text('አሽተሙኚ', x+335, y+340);

	ellipse(x+358, y+266, Genx+65, Geny+65);
	text('አስፎ', x+345, y+270);
	
}

// Gen 2
function Gen2()	{
	ellipse(x+300, y+300, Genx+340, Geny+340);
	
	ellipse(x+300, y+165, Genx+65, Geny+65);
	text('አዝንፋዝ', x+280, y+165);

}

// Gen 3
function Gen3()	{
	ellipse(x+300, y+300, Genx+480, Geny+480);
	
	ellipse(x+300, y+95, Genx+65, Geny+65);
	text('ደንበላዝ', x+280, y+95);
}

// Gen 4
function Gen4()	{
	ellipse(x+300, y+300, Genx+620, Geny+620);
	
	ellipse(x+300, y+25, Genx+65, Geny+65);
	text('ሰርፄ', x+290, y+25);
}

// Gen 5
function Gen5()	{
	ellipse(x+300, y+300, Genx+820, Geny+820);
	
	ellipse(x+300, y-45, Genx+65, Geny+65);
	text('ተክሌ', x+290, y-40);

}


	/*
ራስ ደመክርስቶስ
	ልብሶ
	አንበሳ
	*/
