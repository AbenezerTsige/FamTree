// Family Tree
var Genx = 65;
var Geny = 65;

function setup() {

	createCanvas(850, 700);
}

function draw() {
	
	background(85);


	Gen4();
	Gen3();
	Gen2(); 
	SebatBet(); // Gen 1
	Orgins();  	// Gen 0

}

// Gen 0
function Orgins() {

	ellipse(300, 300, Genx, Geny); 
	text('ዮትባነኺ', 280, 300);
}

// Gen 1
function SebatBet()	{

	ellipse(300, 300, Genx + 135, Geny + 135); // 7 bet circle
	
	ellipse(299, 235, Genx, Geny); 
	text('ደሳ', 290, 235);

	ellipse(243, 270, Genx, Geny);
	text('አክሊል', 225, 270);

	ellipse(242, 336, Genx, Geny);
	text('ውድማጠረ', 210, 345);

	ellipse(300, 367, Genx, Geny);
	text('ጀረትማ', 280, 370);

	ellipse(358, 332, Genx, Geny);
	text('አሽተሙኚ', 335, 340);

	ellipse(358, 266, Genx, Geny);
	text('አስፎ', 345, 270);
	
}

// Gen 2
function Gen2()	{
	ellipse(300, 300, 340, 340);
	
	ellipse(300, 165, 65, 65);
	text('አዝንፋዝ', 280, 165);

}

// Gen 3
function Gen3()	{
	ellipse(300, 300, 480, 480);
	
	ellipse(300, 95, Genx, Geny);
	text('ደንበላዝ', 280, 95);
}

// Gen 4
function Gen4()	{
	ellipse(300, 300, 610, 610);
	
	ellipse(300, 25, Genx, Geny);
	text('ሰርፄ', 280, 25);
}

// Gen 5
function Gen5()	{
	ellipse(300, 300, 340, 340);
	
	ellipse(300, 165, 65, 65);
	text('ተክሌ', 280, 165);

}


	/*
ራስ ደመክርስቶስ
	ልብሶ
	አንበሳ
	*/
