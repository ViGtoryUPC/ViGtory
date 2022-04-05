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

function newParamsLimit(params, new_l){
	//Recibimos un objeto URLSearchParams y devolvemos una copia con el parámetro lim cambiado

	let params_ = new URLSearchParams(params.toString());
	//if (new_l){
		params_.set("lim", new_l);
	/*}
	else{
		params_.delete("lim");
	}*/

	return params_;
}

function newParamsOrdre(params, new_o, new_c){
	//Recibimos un objeto URLSearchParams y devolvemos una copia con los parámetros ord y cri cambiados

	//data["ordre"] = this.ordre; //-1; //( 1=Ascendent | -1=Descendent )
	//data["criteri"] = this.criteri; //0; //( 0=Data | 1=Vots )

	let params_ = new URLSearchParams(params.toString());
	//if (new_o != -1){
		params_.set("ord", new_o.toString());
	/*}
	else{
		params_.delete("ord");
	}*/

	//if (new_c != 0){
		params_.set("cri", new_c.toString());
	/*}
	else{
		params_.delete("cri");
	}*/


	return params_;
}




class OrdreDropdown extends React.Component {

	constructor(props) {
		super(props);
		this.current_ordre = props.current_ordre;
		this.current_criteri = props.current_criteri;
		//this.hasBeenUsed = false;

		let params = new URLSearchParams(window.location.search);
		//this.ordre_search = params.get("ord");
		//this.criteri_search = params.get("cri");
		this.hasBeenUsed = false;

		this.valid_ordres = [-1, 1];
		this.valid_criteris = [0, 1];
		//this.default_value = {"ordre": -1, "criteri": 0};
		//this.updateSelected({"ordre": -1, "criteri": 0});
		//this.selected_text = "";
	}

	updateSelected(selected){
		selected = JSON.parse(selected);
		//console.log(selected);
		this.hasBeenUsed = true;
		this.props.update_ordre(selected["ordre"], selected["criteri"]);
		this.current_ordre = parseInt(selected["ordre"]);
		this.current_criteri = parseInt(selected["criteri"]);
		this.forceUpdate();
	}

	ordreJSON(ordre, criteri){
		return {"ordre": ordre, "criteri": criteri};
	}
	getJSONtext(json){
		//data["ordre"] = -1; //( 1=Ascendent | -1=Descendent )
		//data["criteri"] = 0; //( 0=Data | 1=Vots )
		let text = "Ordre: ";
		if (json["criteri"] === 1){
			text += (json["ordre"]===1 ? "Pitjor" : "Millor") + " valorades"
		}
		else{
			if (json["criteri"] === 0){
				text += "Data";
			}
			text += " "+(json["ordre"]===1 ? "ascendent" : "descendent");
		}

		return text;
	}
	

	render(){
		this.current_ordre = this.hasBeenUsed ? this.current_ordre : ( this.current_ordre ? this.current_ordre : (this.props.current_ordre ? this.props.current_ordre : -1));

		this.current_criteri = this.hasBeenUsed ? this.current_criteri : ( this.current_criteri ? this.current_criteri : (this.props.current_criteri ? this.props.current_criteri : 0));

		//console.log(this.ordreJSON(this.current_ordre, this.current_criteri));
		//console.log(this.getJSONtext(this.ordreJSON(this.current_ordre, this.current_criteri)))

		return(<>

			<DropdownButton
				align="end"
				key={"dropdownbutton"}
				variant="outline-primary"
				size="sm"
				title={this.getJSONtext(this.ordreJSON(this.current_ordre, this.current_criteri))}
				onSelect={(e)=>{this.updateSelected(e)}}
			>
				
				{ this.valid_criteris.map((v_c, k_c) => { 
					return this.valid_ordres.map((v_o, k_o) => { 
					let json = this.ordreJSON(v_o, v_c);
					//console.log(this.getJSONtext(json));
					return (
						<>
						<Dropdown.Divider className="my-0" key={k_c+"_"+k_o+"_"} />
						<Dropdown.Item key={k_c+"_"+k_o}
							eventKey={JSON.stringify(json)}
							className={(this.current_ordre===v_o && this.current_criteri===v_c)?"current_selection":""}
						>
							{this.getJSONtext(json)}
						</Dropdown.Item>
						</>
					)

				} )
				} ) }

			</DropdownButton>

		</>);
	}

}



class LimitDropdown extends React.Component {

	constructor(props) {
		super(props);
		//this.hasBeenUsed = false;

		let params = new URLSearchParams(window.location.search);
		this.hasBeenUsed = false;

		this.validValues = [5,10,15,20,25,30,40,50];
		//this.limit_search = params.get("lim");
		this.current_limit = props.current_limit;
		// ? this.findClosest(props.current_limit) : this.validValues[this.validValues.length/2];
	}


	findClosest(goal){
		var closest = this.validValues.reduce(function(prev, curr) {
			return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
		  });
		return closest;
	}


	updateSelected(selected){
		//console.log(selected);
		selected = this.findClosest(selected);
		this.hasBeenUsed = true;
		this.props.update_limit(selected);
		this.current_limit = selected;
		this.forceUpdate();
	}


	render(){

		this.current_limit = this.hasBeenUsed ? this.current_limit : ( this.current_limit ? this.current_limit : (this.props.current_limit ? this.findClosest(this.props.current_limit) : this.validValues[this.validValues.length/2]) );

		return(<>

			<DropdownButton
				key={"dropdownbutton"}
				variant={"outline-primary"}
				size="sm"
				title={this.current_limit+" Publicacio"+(this.current_limit==1 ? "":"ns")+"/Pàg."}
				onSelect={(e)=>{this.updateSelected(e)}}
			>
				
				{ this.validValues.map((v, k) => { 
					return (
						<>
						{k!==0 ? <Dropdown.Divider className="my-0" key={k+"_"} /> : ""}
						<Dropdown.Item key={k}
							eventKey={v}
							className={"d-flex justify-content-end"+((this.current_limit===v)?" current_selection":"")}
						>
							{v}{" Publicacio"}{v==1 ? "":"ns"}{"/Pàgina"}
						</Dropdown.Item>
						</>
					)
				} ) }

			</DropdownButton>

		</>);
	}

}







class AssignaturesDropdown extends React.Component {

	constructor(props) {
		super(props);
		this.current_assignatura = props.current_assignatura;
		//this.hasBeenUsed = false;

		let params = new URLSearchParams(window.location.search);
		this.assignatura_search = params.get("sub");
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



	/*updateSelected(selected, actionbyuser){
		//this.props.update_assignatura(selected);
		if (actionbyuser){this.hasBeenUsed = true;}
		if (!this.hasBeenUsed || actionbyuser){
			this.current_assignatura = selected;
			this.forceUpdate();
		}
	}*/



	updateSelected(selected){
		//console.log(selected);
		this.hasBeenUsed = true;
		this.props.update_assignatura(selected);
		this.current_assignatura = selected;
		this.forceUpdate();
	}




	render(){

		//let current_assignatura = this.current_assignatura;
		//this.current_assignatura = ( this.current_assignatura ? this.current_assignatura : (this.props.current_assignatura ? this.props.current_assignatura : null) );
		this.current_assignatura = this.hasBeenUsed ? this.current_assignatura : ( this.current_assignatura ? this.current_assignatura : (this.props.current_assignatura ? this.props.current_assignatura : null) );

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
				title={this.current_assignatura?this.current_assignatura:(this.hasBeenUsed?"General":"Assignatura")}
				onSelect={(e)=>{this.updateSelected(e)}}
			>
				<Dropdown.Item key={-1}
					eventKey={""}
					className={this.current_assignatura?"":"current_selection"}
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
							className={(this.current_assignatura===v.sigles_ud)?"current_selection":""}
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

		this.assignDrop_ref = React.createRef();

		
		this.current_limit = props.current_limit;
		this.limitDrop_ref = React.createRef();

		this.current_ordre = props.current_ordre;
		this.current_criteri = props.current_criteri;
		this.ordcriDrop_ref = React.createRef();
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
	update_limit(selected){
		this.current_limit = selected;
		//this.forceUpdate();
	}
	update_ordre(selected_ordre, selected_criteri){
		this.current_ordre = selected_ordre;
		this.current_criteri = selected_criteri;
		//this.forceUpdate();
	}



	updateSubjectList(data){
		this.subjectList = data;
		this.forceUpdate();
	}

	newParams(o_params, new_se, new_su, new_li, new_o, new_c){
		let params = newParamsSearch(o_params, new_se);
		params = newParamsSubject(params, new_su);
		params = newParamsLimit(params, new_li);
		params = newParamsOrdre(params, new_o, new_c);
		params.delete("p");
		return params;
	}

	executeSearch(){
		this.props.navigate(this.props.location+"?"+this.newParams(this.params, this.current_search, this.current_assignatura, this.current_limit, this.current_ordre, this.current_criteri));
	}
	


	updateSelectedAssignatura(selected){
		if (this.assignDrop_ref.current)
			this.assignDrop_ref.current.updateSelected(selected);
	}
	updateSearch(selected){
		this.current_search = selected;
	}
	updateLimit(selected){
		if (this.limitDrop_ref.current)
			this.limitDrop_ref.current.updateSelected(selected);
	}
	updateOrdre(selected_o, selected_c){
		//console.log("UPDATE ORDRE");
		if (this.ordcriDrop_ref.current){
			//console.log("UPDATE ORDRE EFECTIU");
			//console.log(JSON.stringify(this.ordcriDrop_ref.current.ordreJSON(selected_o, selected_c)));
			this.ordcriDrop_ref.current.updateSelected(
				JSON.stringify(this.ordcriDrop_ref.current.ordreJSON(selected_o, selected_c))
				);
		}
	}
	


	render(){

		this.params = new URLSearchParams(window.location.search);
		//defaultValue={(this.props.current_search==null)?"":this.props.current_search}
		
		return(
			<div className="vig_search m-auto my_dropdown_selector" >
			{/*Usamos la estructura form para que se pueda ejecutar la búsqueda con tan solo pulsar Enter*/}
			<Form noValidate method="post" action="http://httpbin.org/post" onSubmit={(e) => {e.preventDefault(); this.executeSearch();}} >



			<InputGroup 
				className="mb-1"
				size="md"
			>

				

				<AssignaturesDropdown current_assignatura={this.props.current_assignatura} subjectList={this.subjectList} update_assignatura={(e) => {this.update_assignatura(e);}} />




					{/*className="w-50"*/}
				<FormControl 
					type="text" 
					placeholder="Termes a cercar" 
					defaultValue={this.current_search}
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



			<InputGroup 
				className="mb-3 limit_ordre_dropdowns d-flex flex-fill"
				size="md"
			>
			
				<LimitDropdown current_limit={this.props.current_limit} update_limit={(sel) => {this.update_limit(sel);}} ref={this.limitDrop_ref} />

				<OrdreDropdown current_ordre={this.props.current_ordre} current_criteri={this.props.current_criteri} update_ordre={(sel_o, sel_c) => {this.update_ordre(sel_o, sel_c);}} ref={this.ordcriDrop_ref} />

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
	let screen = <InitialScreen navigate={navigateTo} location={loc} current_assignatura={props.current_assignatura} current_search={props.current_search} ref={screen_ref} current_limit={props.current_limit} />;

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