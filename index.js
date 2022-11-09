const fs = require('fs');
const http = require('http');
const querystring = require('querystring');
const slugify = require('slugify');



const replaceTemplate = (temp, product) => {
	let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
	output = output.replace(/{%IMAGE%}/g, product.image);
	output = output.replace(/{%PRICE%}/g, product.price);
	output = output.replace(/{%FROM%}/g, product.from);
	output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
	output = output.replace(/{%QUANTITY%}/g, product.quantity);
	output = output.replace(/{%DESCRIPTION%}/g, product.description);
	output = output.replace(/{%ID%}/g, product.id);

	if(!product.organic) output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
	return output;
}

const tempOverview = fs.readFileSync('./template-overview.html', 'utf-8');
const tempProduct = fs.readFileSync('./template-product.html', 'utf-8');
const tempCard = fs.readFileSync('./template-card.html', 'utf-8');


const data = fs.readFileSync('./data.json', 'utf-8');
const dataObj = JSON.parse(data);


const slugs = dataObj.map(el => slugify(el.productName, {lower:true}));

// Server
const server = http.createServer((req,res)=> {

	const baseURL = `http://localhost:443/`;
  const requestURL = new URL(req.url, baseURL);

	const pathName = requestURL.pathname;
	const query = requestURL.searchParams
		.get('id');

	if(pathName === '/overview' || pathName === '/'){
		res.writeHead(200, { 'content-type': 'text/html'});

		const cardshtml = dataObj
			.map(el => replaceTemplate(tempCard, el))
			.join('');
		const output = tempOverview
			.replace('{%PRODUCT_CARDS%}', cardshtml);

		res.end(output);
	}else if (pathName === '/product'){
		const product = dataObj[query];
		const output = replaceTemplate(tempProduct, product);

		res.writeHead(200, { 'content-type': 'text/html'});
		res.end(output);
	}else if (pathName === '/API'){
		// typical ${__dirname} instead of . - not working lols
		res.writeHead(200, { 'content-type': 'application/json'});
		res.end(data);

	}else{
		// header must be before res.end
		res.writeHead(404,{
			'Content-type': 'text/html'
		});
		res.end('<h1> 404 PAGE NOT FOUND </h1>');
	}


});

server.listen(443);
