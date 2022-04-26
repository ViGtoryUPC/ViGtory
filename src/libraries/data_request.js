/*import React from 'react';
import PropTypes from 'prop-types';*/
import {API_address} from './API_address';
import { Cookie } from './cookie';











async function requestData(route, needAuth){
	
	let err_mssg = "En aquests moments sembla que no podem contactar els nostres servidors.\nTorna a intentar-ho més endevant.";

	let response = {};
	let promise = new Promise(()=>{}, ()=>{}, ()=>{});
	
	let headers = new Headers();
	//headers.append("Content-Type", "text/plain");
	//headers.append("Content-Type", "application/json");
	headers.append("Content-Type", "application/x-www-form-urlencoded");
	//headers.append("Access-Control-Allow-Origin", "*");
	
	if (needAuth){
		headers.append("authorization", Cookie.get("jwt"));
	}

	let jsondata = {};

	return await fetch(
		(API_address + route), {
			method: "GET",
			mode: 'cors',
			//body: data,
			headers: headers,
			timeout: 5000//,
			//authorization: (needAuth ? (Cookie.get("jwt")) : "" )
	})
	.then(
		resp => { //SÍ ha sido posible conectar con la API

			//Si todo es correcto (status 200-299)
			if (resp.ok){
				response = resp.json();
				//Aquí se podrían hacer cosas pero no es necesario
			}
			else{
				window.alert(resp.statusText);
				return;
			}
			
			return response;
		}, 
		resp => { //NO sido posible conectar con la API
			window.alert(err_mssg);
			return;
		}
	)
	/*.then(
		data => {
			if (data === undefined) return;
			//console.log(data);
			jsondata = data;
			callback(data);
			return data;
		}
	);

	console.log(jsondata);*/
	//return jsondata;


}














const getUserData = () => {
	/*const userData = */return requestData("/user/getInfoUsuari", true);
	//let userData = {};
	//requestData("/user/getInfoUsuari", true).then(data => {
	//	userData = data;
	//});

	/*let userData = {
		"email": "nekito@neko.nek",
		"emailConfirmed": true,
		"emailStudent": "nekito@estudiantat.upc.edu",
		"emailStudentConfirmed": true,
		"grauInteres": 1339,
		"usuari": "nekito"
	}*/

	//console.log(userData);

	//return userData;
}












const getDegreeList = ()=>{
	//let graus = requestDegreeList("/grau/getAllGraus", false).graus;
	return requestData("/grau/getAllGraus", false);

	//Hardcoded provisional
	/*let graus = [
		{
			codi_programa: 1339,
			nom: "GRAU EN ENGINYERIA INFORMÀTICA"
		},
		{
			codi_programa: 683,
			nom: "GRAU EN ENGINYERIA ELECTRÒNICA INDUSTRIAL I AUTOMÀTICA"
		},
		{
			codi_programa: 682,
			nom: "GRAU EN ENGINYERIA MECÀNICA"
		},
		{
			codi_programa: 681,
			nom: "GRAU EN ENGINYERIA ELÈCTRICA"
		},
		{
			codi_programa: 666,
			nom: "GRAU EN ENGINYERIA DE DISSENY INDUSTRIAL I DESENVOLUPAMENT DEL PRODUCTE"
		}
	];



	return graus;*/
};





const getSubjectList = ()=>{

	return requestData("/assignatura/getAssignatures", true);

	//let assignatures = requestDegreeList("/assignatura/getAssignatures", true).assignatures;

	//Hardcoded provisional
	/*let assignatures = [
		{
			sigles_ud: "SEDI-D5O10",
			nom: "aaaaaaaaaaaaaaaaaaaa",
			tipus: "OB"
		},
		{
			sigles_ud: "XASF",
			nom: "bbbbbbbbbbbbbbbbb",
			tipus: "OB"
		},
		{
			sigles_ud: "MARK-D7O32",
			nom: "cccccccccccccccccccccccccc",
			tipus: "OP"
		},
		{
			sigles_ud: "PEDT",
			nom: "ddddddddddddddddddd",
			tipus: "OB"
		},
		{
			sigles_ud: "XACO-C4O44",
			nom: "eeeeeeeeeeeeeeeeeee",
			tipus: "OP"
		}
	];*/



	//return assignatures;
};



















const getValidationRegexAndErrorMessages = ()=>{

	//Uso de los regex: regex.test(string); //(pero el regex es idetificado por las barras, y no puede ser un string)
	//Para poder usar el string regex a modo de objeto regex, hará falta usar RegExp y slice:
	//(new RegExp("/^.+@.+$/".slice(1, -1)).test("hola@gmail.com"));

	let validation_rgx_msg = 
	{
		"username" : [
			{"/^.{2,32}$/" : "El teu nom d'usuari només pot ocupar 2-32 caràcters."},
			{"/^[a-zA-Z0-9_\\-\\.]+$/" : "El teu nom d'usuari només pot contenir caràcters [a-z, A-Z, 0-9, _, -, .]."}
		],
		"password" : [
			{"/^.{8,32}$/" : "La teva contrasenya només pot ocupar 8-32 caràcters."},
			{"/^[a-zA-Z0-9_\\-\\.]+$/" : "La teva contrasenya només pot contenir caràcters [a-z, A-Z, 0-9, _, -, .]."},
			{"/(?=.*[a-z])/" : "La teva contrasenya ha de contenir almenys 1 lletra minúscula (a-z)."},
			{"/(?=.*[A-Z])/" : "La teva contrasenya ha de contenir almenys 1 lletra majúscula (A-Z)."},
			{"/(?=.*[0-9])/" : "La teva contrasenya ha de contenir almenys 1 nombre (0-9)."}
		],
		"mail" : [
			//{"/\\s/" : "Una adreça electrònica no hauria de contenir espais (' ')."},
			{"/^.+@.+\\..+$/" : "És necessària una adreça electrònica vàlida.\nPer exemple: usuari@domini.xyz"}
		]

	};

	//Como lo pasaremos como prop, no hace falta hacer JSON.stringify()
	return validation_rgx_msg;
}














export { getDegreeList, getValidationRegexAndErrorMessages, getUserData, getSubjectList }