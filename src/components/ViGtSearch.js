import React from 'react';
import { useEffect } from 'react';
import {API_address} from '../libraries/API_address';
//import ReactDOM from 'react-dom';
import { useNavigate, useLocation, Link } from "react-router-dom";

import { InputGroup, Dropdown, DropdownButton, FormControl, Button, Form, FloatingLabel } from 'react-bootstrap';


import {getSubjectList} from '../libraries/data_request';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/ViGtSearch.css';

import search_img from '../assets/images/Search.png';






function newParamsSearch(params, new_s){
	//Recibimos un objeto URLSearchParams y devolvemos una copia con el parámetro search cambiado

	let params_ = new URLSearchParams(params.toString());
	if ((new_s != null) && (new_s != "")){
		params_.set("search", new_s);
	}
	else{
		params_.delete("search");
	}

	return params_;
}

function newParamsSubject(params, new_s){
	//Recibimos un objeto URLSearchParams y devolvemos una copia con el parámetro sub cambiado

	let params_ = new URLSearchParams(params.toString());
	if (new_s){
		params_.set("sub", new_s);
	}
	else{
		params_.delete("sub");
	}

	return params_;
}








class AssignaturesDropdown extends React.Component {

	constructor(props) {
		super(props);
		this.current_assignatura = props.current_assignatura;
		this.hasBeenUsed = false;
	}



	alphabetize(json_list){
		//return json_list;
		if (!json_list) return [];
		let prop = "sigles_ud";
		return json_list.sort(
			(a, b) => {
				if (a[prop] > b[prop]) {return 1;}
				else if (a[prop] < b[prop]) {return -1;}
				return 0;
			}
		);
	}



	updateSelected(selected){
		//console.log(selected);
		this.hasBeenUsed = true;
		this.props.update_assignatura(selected);
		this.current_assignatura = selected;
		this.forceUpdate();
	}




	render(){

		let current_assignatura = this.current_assignatura;
		let assignatures = this.alphabetize(this.props.subjectList.assignatures);
		//let assignatures = this.props.subjectList.assignatures;
		//let assignatures = this.assignatures;

		//console.log(
		//	assignatures.map((k,v)=>{return v.sigles_ud})
		//);

		//console.log(current_assignatura); //null si no existe
		//console.log(assignatures); //undefined si no existe



		return(

			<DropdownButton
				key={"dropdownbutton"}
				size="sm"
				title={current_assignatura?current_assignatura:(this.hasBeenUsed?"General":"Assignatura")}
				onSelect={(e)=>{this.updateSelected(e)}}
			>
				<Dropdown.Item key={-1}
					eventKey={""}
					className={current_assignatura?"":"current_assignatura"}
				>
					<b key={-1+"b"}>{"General"}</b><br key={-1+"br"}/>
					&nbsp;&nbsp;&nbsp;
					{"  ⤷ "+"Totes les assignatures"}
				</Dropdown.Item>
				



				{ assignatures ? 
					assignatures.map((v, k) => { 
					return (
						<>
						<Dropdown.Divider className="my-0" key={k+"_"} />
						<Dropdown.Item key={k}
							eventKey={v.sigles_ud}
							className={(current_assignatura===v.sigles_ud)?"current_assignatura":""}
						>
							<b key={k+"b"}>{v.sigles_ud}</b>
							{" "+
							(v.tipus=="OB"?""/*"(obligatòria)"*/:
								((v.tipus=="OP"?"(optativa)":""))
							)}<br key={k+"br"}/>
							&nbsp;&nbsp;&nbsp;
							{"  ⤷ "+v.nom}
						</Dropdown.Item>
						</>
					)
				} ) : "" }

			</DropdownButton>


		);
	}


}










class InitialScreen extends React.Component {

	constructor(props) {
		super(props);
		//Es necesario el state????
		this.state = {
			current_assignatura: props.current_assignatura,
			current_search: props.current_search
		};
		this.current_assignatura = props.current_assignatura;
		this.current_search = props.current_search;
		this.subjectList = {};
	}


	update_assignatura(selected){
		this.current_assignatura = selected;
		//console.log(selected);
		//this.forceUpdate();
	}

	update_search(event){
		this.current_search = event.currentTarget.value;
		//this.forceUpdate();
	}


	updateSubjectList(data){
		this.subjectList = data;
		this.forceUpdate();
	}

	newParams(o_params, new_se, new_su){
		let params = newParamsSearch(o_params, new_se);
		params = newParamsSubject(params, new_su);
		return params;
	}

	executeSearch(){
		this.props.navigate(this.props.location+"?"+this.newParams(this.params, this.current_search, this.current_assignatura));
	}
	

	
	render(){

		this.params = new URLSearchParams(window.location.search);
		//defaultValue={(this.props.current_search==null)?"":this.props.current_search}
		
		return(
			<div className="vig_search m-auto assignatura_selector" >
			{/*Usamos la estructura form para que se pueda ejecutar la búsqueda con tan solo pulsar Enter*/}
			<Form noValidate method="post" action="http://httpbin.org/post" onSubmit={(e) => {e.preventDefault(); this.executeSearch();}} >



			<InputGroup 
				className="mb-3"
				size="md"
			>

				

				<AssignaturesDropdown current_assignatura={this.props.current_assignatura} subjectList={this.subjectList} update_assignatura={(e) => {this.update_assignatura(e);}} />




					{/*className="w-50"*/}
				<FormControl 
					type="text" 
					placeholder="Termes a cercar" 
					defaultValue={this.props.current_search}
					onChange={(e) => {this.update_search(e);}}
				 />





				<Button 
					id="button-search"
					onClick={() => {this.executeSearch()}}
					type="submit"
				>
					{//🔎&#xFE0E; es el icono de la lupa junto con un selector de variable Unicode para que no sea mostrada por pantalla como emoticono (alternativa? 🔎&#xFE0F;
					}
					{/*
					<span style={{
						fontFamily: "Monospace",
						filter: "grayscale(100%)"
						}}>
						🔎&#xFE0E;
					</span>
					*/}
					{/*" Cerca"*/}

					<img id="search_img" src={search_img} className="mx-auto d-inline" alt="Cerca a ViGtory!" />

				</Button>

			</InputGroup>
			</Form>
			</div>
		);

	};
}






function ViGtSearch(props){

	let navigate = useNavigate();
	function navigateTo(page) {
		navigate(page);
	}

	const location =  useLocation()
	let loc = location.pathname;
	//console.log(loc);






	//let screen_ref = React.createRef();
	//let screen = <InitialScreen navigate={navigateTo} location={loc} current_assignatura={props.current_assignatura} current_search={props.current_search} ref={screen_ref} />;
	let screen_ref = props.search_ref;
	//let screen_ref = props.search_ref ? props.postedit_ref : React.createRef();
	let screen = <InitialScreen navigate={navigateTo} location={loc} current_assignatura={props.current_assignatura} current_search={props.current_search} ref={screen_ref} />;

	useEffect(() => {
		
			getSubjectList().then((data) => {
				//console.log(data);
				if (screen_ref.current)
				screen_ref.current.updateSubjectList(data);
			});

	}, []);






	return(
		<>
		{screen}
		</>
	)
}
export default ViGtSearch;