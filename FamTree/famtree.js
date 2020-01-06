/*

This program helps you build your family tree.

1. Get gen0 total number of siblings
2. Enter oldest sibling first, last youngest
3. After a single sibling entery create a circle
4. Then connect with a line to a sibling if avialble
5. After all sibling having been enter, circle of gen
*/

let x = window.innerWidth;
let y = window.innerHeight;

let b, b1, b2, b3, b4, b5, b6, b7, b8, b9; 						// Buttons 
let ip, ip1, ip2, ip3, ip4, ip5;								// Gen 0 Inputs
let pi1, pi2, gpi1, gpi2, ggpi1, ggpi2, gggpi1, gggpi2;        	// Parent input

let cx, cy, cl, ch;
cx = x / 1.5;   	// Circle body x position 
cy = 500;  			// Circle body y position
cl = 200;  			// Circle Length 
ch = 200;  			// Circle Heigth

// Sibling Border 
let lny = 100;
let lnx = 630;

// Change y position of persons 
let sy = 0; 
let dmy = 0;


function setup() {
	//var canvas = createCanvas(x, y);  // Full screen for any window size 
  	canvas = createCanvas(3000, 3000);
  	background(51); 					// Dark Background
  
  	var fx, fy;
 	fx = (x/2) - 180;
	fy = 60;
	
	fill(255,215,0);	 					// Orangeish 	
	rect(fx - 20, 25, 340, 45);				// Fam Tree Border 		
	textSize(40);
	fill(0);
	text('Fam Tree Builder', fx, fy);

	// First Questions
	fill(255,215,0);	 					// Orangeish
	rect(40, lny + 20, 150, 55);			// Sibling Border 	
	fill(0);
	text('Siblings', 45, lny + 60);
	
	fill(255,255,255);
	noStroke(); 
	textSize(20);
	textFont('Georgia');
	text('1. How many siblings do you have ?', 40, 220);

  	ip = createInput();				// First Input gets the sibling count 
  	ip.position(365, 200);
  
  	b = createButton('submit');
  	b.position((ip.x + ip.width)+15, 200);  	// Align button where input is 
  	b.mousePressed(getSib);           		// b is first button 
}

function draw() {
	
	//table();

	
}

function table() {
	// Total Tree Box
	var tx, ty;
	tx = 1000;
	ty = 1200;
	lx = 700;

	// Horizontal Lines
	stroke(126);
	line(600, 100, 600, y);					
	line(700, 100, 700, 2000);
	line(800, 100, 800, 2000);
	line(900, 100, 900, 2000);
	line(1000, 100, 1000, 2000);
	line(1100, 100, 1100, 2000);
	line(1200, 100, 1200, 2000);
	line(1300, 100, 1300, 2000);
	line(1400, 100, 1400, 2000);

	// Vertical Lines
	line(600, 100, 2000, 100);					
	line(600, 200, 2000, 200);
	line(600, 300, 2000, 300);
	line(600, 400, 2000, 400);
	line(600, 500, 2000, 500);
	line(600, 600, 2000, 600);
	line(600, 700, 2000, 700);
	line(600, 800, 2000, 800);
	line(600, 900, 2000, 900);

}

function getSib()  {
	const s = ip.value(); 		// Number of siblings
  	
	switch(s) {
    	case "1" :
      		text('2. Enter the first childs name', 40, 270);
      		
      		ip1 = createInput();						 // First Input gets the sibling count
  			ip1.position(300, 255);
  			
  			b1 = createButton('submit');
  			b1.position((ip1.x + ip1.width) + 15, 255);  // Align button where input is 
 			b1.mousePressed(s1);

      		break;
   
	    case "2" :
	      	text('2. Enter their names', 40, 140);
      		ip2 = createInput();    // Oldest child 
  			ip2.position(230, 125);
  			ip3 = createInput();    // Second Oldest child 
  			ip3.position(360, 125);

  			b2 = createButton('submit');
  			b2.position((ip3.x + ip3.width) + 15, 125);  // Align button where input is 
 			b2.mousePressed(s2);
	      	break;

	    case "3" :
	    	text('2. Enter their names', 40, 140);
      		ip2 = createInput();    // Oldest child 
  			ip2.position(40, 150);
  			ip3 = createInput();    // Second Oldest child 
  			ip3.position(170, 150);
  			ip4 = createInput();    // Third Oldest child 
  			ip4.position(300, 150);

  			b3 = createButton('submit');
  			b3.position((ip4.x + ip4.width) + 15, 150);  // Align button where input is 
 			b3.mousePressed(s3);
	      	break;
	      
	    case "4" :
	      	text('2. Enter their names', 40, 140);
      		ip2 = createInput();    // Oldest child 
  			ip2.position(40, 150);
  			ip3 = createInput();    // Second Oldest child 
  			ip3.position(170, 150);
  			ip4 = createInput();    // Third Oldest child 
  			ip4.position(300, 150);
  			ip5 = createInput();    // Fourth Oldest child 
  			ip5.position(430, 150);

  			b4 = createButton('submit');
  			b4.position((ip5.x + ip5.width) + 15, 150);  // Align button where input is 
 			b4.mousePressed(s4);
	      	break;
	  }
}

// S1 = Only one child 
function s1() { 

	const kd1 = ip1.value(); 		// Get me name 

	// Gen 0 border 
	fill(255, 0, 255);
	rect(800, 100, 200, 200);

	// Me 
  	fill(218,165,32); 				// Gold = Blue Plus Pink		  
  	ellipse(900, 200, 100, 100);  

  	// Me Name 
  	fill(255,255,255); 			  		
  	textSize(20);
  	text(kd1, 880, 200);
  	getPnames();
  
} 

function getPnames()	{

	var px, py, ph, pl;
	px = 40;
	py = 300;

	fill(255,215,0);	 		// Orangeish 
	rect(px, py, 150, 45);		// Parents Border
	fill(0); 					// Black text
	textSize(40);
	text('Parents', px + 5, py += 35);

	fill(255,255,255);
	noStroke(); 
	textSize(20);
	textFont('Georgia');
	
	text('1. Enter your dads name', px, py += 60);
	text('2. Enter your moms name', px, py += 40);
	
	// Input for your parents name   
	pi1 = createInput();	
	pi2 = createInput();
  	pi1.position(px += 230, py -= 60);				  
  	pi2.position(px += 15, py += 40);
  	
  	// Sumbit Button 
  	b5 = createButton('submit');
  	b5.position((pi2.x + pi2.width)+15, py);  // Align button where input is 
 	b5.mousePressed(parents);
 
}

function parents()	{

	//###############################
	// Gen 1 : Parents              #
	//###############################
  	
  	const dad= pi1.value();
  	const mom = pi2.value();

	// Gen 1 box border 
	fill(0, 0, 255);
	rect(700, 100, 400, 600);

  	// Dad - Blue 
	fill(0,255,0); 					
	ellipse(900, 200, 100, 100);  

	// Mom - pink
	fill(255,20,147); 				 
	ellipse(900, 600, 100, 100);  

	fill(255,255,255); 			  	
  	textSize(20);
  	text(dad, 880, 200);
  	text(mom, 880, 600);

	//###############################
	// Gen 0: First Kids         	#
	//###############################
	
	const kd1 = ip1.value(); 		// Get me name 

	// Gen 0 border 
	fill(255, 0, 255);
	rect(800, 300, 200, 200);

	// Me 
  	fill(218,165,32); 				// Gold = Blue Plus Pink		  
  	ellipse(900, 400, 100, 100);  

  	// Me Name 
  	fill(255,255,255); 			  		
  	textSize(20);
  	text(kd1, 880, 400);

	gp();
}

function gp()	{

	var gx, gy, gh, gl;
	gx = 40;
	gy = 500;

	fill(255,215,0);	 		// Orangeish 
	rect(gx, gy, 270, 45);		// Parents Border
	fill(0); 					// Black text
	textSize(40);
	text('Grand Parents', gx + 5, gy += 35);

	fill(255,255,255);
	noStroke(); 
	textSize(20);
	textFont('Georgia');
	
	text('1. Enter your Grandpa name', gx, gy += 60);
	text('2. Enter your Grandmas name', gx, gy += 40);

	// Input for your parents name   
	gpi1 = createInput();	
	gpi2 = createInput();
  	gpi1.position(gx += 270, gy -= 60);				  
  	gpi2.position(gx += 15, gy += 40);
  	
  	// Sumbit Button 
  	b6 = createButton('submit');
  	b6.position((gpi2.x + gpi2.width)+15, gy);  // Align button where input is 
 	b6.mousePressed(grandparents);

}


function grandparents()	{

	//###############################
	// Gen 2 : Grand Parents        #
	//###############################
  	
  	const gdad= pi1.value();
  	const gmom = pi2.value();

	// Gen 1 box border 
	fill(0,100,0);
	rect(700, 100, 600, 1000);

  	// Dad - Blue 
	fill(0,255,0); 					
	ellipse(1000, 200, 100, 100);  

	// Mom - pink
	fill(255,20,147); 				 
	ellipse(1000, 1000, 100, 100);  

	fill(255,255,255); 			  	
  	textSize(20);
  	text(gdad, 980, 200);
  	text(gmom, 980, 1000);

	//###############################
	// Gen 1 : Parents              #
	//###############################
  	
  	const dad= pi1.value();
  	const mom = pi2.value();

	// Gen 1 box border 
	fill(0, 0, 255);
	rect(800, 300, 400, 600);

  	// Dad - Blue 
	fill(0,255,0); 					
	ellipse(1000, 400, 100, 100);  

	// Mom - pink
	fill(255,20,147); 				 
	ellipse(1000, 800, 100, 100);  

	fill(255,255,255); 			  	
  	textSize(20);
  	text(dad, 980, 400);
  	text(mom, 980, 800);

	//###############################
	// Gen 0: First Kids         	#
	//###############################

	const kd1 = ip1.value(); 		// Get me name 

	// Gen 0 border 
	fill(255, 0, 255);
	rect(900, 500, 200, 200);

	// Me 
  	fill(218,165,32); 				// Gold = Blue Plus Pink		  
  	ellipse(1000, 600, 100, 100);  

  	// Me Name 
  	fill(255,255,255); 			  		
  	textSize(20);
  	text(kd1, 980, 600);

  	ggp();

}

function ggp()	{

	var ggx, ggy, ggh, ggl;
	ggx = 40;
	ggy = 700;

	fill(255,215,0);	 		// Orangeish 
	rect(ggx, ggy, 375, 45);		// Parents Border
	fill(0); 					// Black text
	textSize(40);
	text('Great Grand Parents', ggx + 5, ggy += 35);

	fill(255,255,255);
	noStroke(); 
	textSize(20);
	textFont('Georgia');
	
	text('1. Enter your Great Grandpa name', ggx, ggy += 80);
	text('2. Enter your Great Grandmas name', ggx, ggy += 40);

	// Input for your parents name   
	ggpi1 = createInput();	
	ggpi2 = createInput();
  	ggpi1.position(ggx += 320, ggy -= 60);				  
  	ggpi2.position(ggx += 15, ggy += 40);
  	
  	// Sumbit Button 
  	b7 = createButton('submit');
  	b7.position((ggpi2.x + ggpi2.width)+15, ggy);  // Align button where input is 
 	b7.mousePressed(ggparents);

}

function ggparents() {

	//#####################################
	// Gen 3 : Great Grand Parents        #
	//#####################################
  	
  	const ggdad= pi1.value();
  	const ggmom = pi2.value();

	// Gen 3 box border 
	fill(30,144,255);
	rect(700, 100, 800, 1400);

  	// Dad - Blue 
	fill(0,255,0); 					
	ellipse(1100, 200, 100, 100);  

	// Mom - pink
	fill(255,20,147); 				 
	ellipse(1100, 1400, 100, 100);  

	fill(255,255,255); 			  	
  	textSize(20);
  	text(ggdad, 1080, 200);
  	text(ggmom, 1080, 1400);
	
	//###############################
	// Gen 2 : Grand Parents        #
	//###############################
  	
  	const gdad= pi1.value();
  	const gmom = pi2.value();

	// Gen 1 box border 
	fill(0,100,0);
	rect(800, 300, 600, 1000);

  	// Dad - Blue 
	fill(0,255,0); 					
	ellipse(1100, 400, 100, 100);  

	// Mom - pink
	fill(255,20,147); 				 
	ellipse(1100, 1200, 100, 100);  

	fill(255,255,255); 			  	
  	textSize(20);
  	text(gdad, 1080, 400);
  	text(gmom, 1080, 1200);

	//###############################
	// Gen 1 : Parents              #
	//###############################
  	
  	const dad= pi1.value();
  	const mom = pi2.value();

	// Gen 1 box border 
	fill(0, 0, 255);
	rect(900, 500, 400, 600);

  	// Dad - Blue 
	fill(0,255,0); 					
	ellipse(1100, 600, 100, 100);  

	// Mom - pink
	fill(255,20,147); 				 
	ellipse(1100, 1000, 100, 100);  

	fill(255,255,255); 			  	
  	textSize(20);
  	text(dad, 1080, 600);
  	text(mom, 1080, 1000);

	//###############################
	// Gen 0: First Kids         	#
	//###############################
	
	const kd1 = ip1.value(); 		// Get me name 

	// Gen 0 border 
	fill(255, 0, 255);
	rect(1000, 700, 200, 200);

	// Me 
  	fill(218,165,32); 				// Gold = Blue Plus Pink		  
  	ellipse(1100, 800, 100, 100);  

  	// Me Name 
  	fill(255,255,255); 			  		
  	textSize(20);
  	text(kd1, 1080, 800);

  	//ggp();
}

/*
function gggp()	{

	var gggx, gggy, gggh, gggl;
	gggx = 40;
	gggy = 900;

	fill(255,215,0);	 		// Orangeish 
	rect(gggx, gggy, 485, 45);		// Parents Border
	fill(0); 					// Black text
	textSize(40);
	text('Great Great Grand Parents', gggx + 5, gggy += 35);

	fill(255,255,255);
	noStroke(); 
	textSize(20);
	textFont('Georgia');
	
	text('1. Enter your Great Great Grandpas name', gggx, ggy += 100);
	text('2. Enter your Great Great Grandmas name', gggx, gggy += 40);

	// Input for your parents name   
	gggpi1 = createInput();	
	gggpi2 = createInput();
  	gggpi1.position(gggx += 270, gggy -= 60);				  
  	gggpi2.position(gggx += 15, gggy += 40);
  	
  	// Sumbit Button 
  	b8 = createButton('submit');
  	b8.position((gggpi2.x + gggpi2.width)+15, gggy);  // Align button where input is 
 	b8.mousePressed(dadmom);

}

*/
