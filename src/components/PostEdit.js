import React from 'react';
import { useEffect, useContext } from 'react';
import {API_address} from '../libraries/API_address';
//import ReactDOM from 'react-dom';
import { Routes, Route, Link, useNavigate } from "react-router-dom";

import { Accordion, Button, Form, FloatingLabel, DropdownButton, InputGroup, useAccordionButton, AccordionContext } from 'react-bootstrap';
import { Card, OverlayTrigger, Tooltip, Dropdown, Popover } from 'react-bootstrap';


import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/PostEdit.css';

import {Cookie} from '../libraries/cookie';
import {BaseName} from "../libraries/basename";
import {getSubjectList} from '../libraries/data_request';








async function uploadOrDeleteFile(upTdelF, file, post_id, i, uploaded_ready, checkFinish){

	//console.log("post_id in uploadFile: "+post_id);

	//Aparentemente, el orden en que añadía los datos antes nulificaba el valor de aportacioId y al backend llegaba como undefined.
	//Puesto en este orden ahora funciona
	const data = upTdelF ? (new FormData()) : (new URLSearchParams());
	data.append('aportacioId', post_id);
	if (upTdelF){data.append('file', file, file["name"]);}
	else{data.append('file', file);}



	let err_mssg = "En aquests moments sembla que no podem contactar els nostres servidors.\nTorna a intentar-ho més endevant.";


	let response = {};
	let promise = new Promise(()=>{}, ()=>{}, ()=>{});
	
	let headers = new Headers();
	//headers.append("Content-Type", "multipart/form-data");
	headers.append("authorization", Cookie.get("jwt"));

	let resp_ok = true;

	promise = await fetch(
		API_address + "/aportacio/"+(upTdelF ? "add" : "delete")+"File", {
			method: (upTdelF ? "POST" : "DELETE"),
			//mode: 'cors',
			headers: headers,
			body: data,
			redirect: 'follow',
			timeout: 5000
	})
	.then(
		resp => { //SÍ ha sido posible conectar con la API

			//Si todo es correcto (status 200-299)
			if (resp.ok){
				response = resp.json();
				
				//Si todo va bien, podríamos hasta volver a cargar la página para mostrar los nuevos datos! O la vista individual de la publicación
				//location.reload();
			}
			/*else{
				window.alert(resp.statusText);
				return;
			}*/
			
			return response;
		}, 
		resp => { //NO ha sido posible conectar con la API
			window.alert(err_mssg);
			return;
		}
	)
	.then(
		data => {
			//console.log(data);

			if (data === undefined) return;
			
			if (!resp_ok){
				window.alert(data.error);
				return;
			}



			uploaded_ready[i] = true;
			checkFinish();
		}
	);


}







async function createOrUpdatePostToAPI(createTupdateF, text_data, route, files_to_add, files_to_delete/*, navigate*/){
	//console.log(event.currentTarget.action);
	//event.currentTarget.submit();
		//event.currentTarget.action = API_address + "/aportacio/" + route;
	//event.currentTarget.action = "http://nekoworld.dynu.net" + "/user/" + route;
	//console.log(event.currentTarget.action);
	//event.currentTarget.submit();

	/*const data = new URLSearchParams();
	for (const pair of new FormData(event.currentTarget)) {
		data.append(pair[0], pair[1]);
	}
	data.append("sigles_ud", more_data);*/
	const data_to_send = new URLSearchParams();
	for (var key of Object.keys(text_data)) {
		//console.log(key+" -> "+text_data[key]);
		data_to_send.append(key, text_data[key]);
	}
	//console.log(data.toString());



	//console.log(files_to_add);
	//console.log(files_to_add[0]["name"]);
	//return;


	/*console.log(null);
	console.log(undefined);
	console.log("null "+null);
	console.log("undefined "+undefined);
	console.log("titol: "+data.get("titol"));
	console.log("body: "+data.get("body"));
	console.log("sigles_ud: "+data.get("sigles_ud"));*/

	//return;

	let err_mssg = "En aquests moments sembla que no podem contactar els nostres servidors.\nTorna a intentar-ho més endevant.";


	let response = {};
	let promise = new Promise(()=>{}, ()=>{}, ()=>{});
	
	let headers = new Headers();
	//headers.append("Content-Type", "text/plain");
	//headers.append("Content-Type", "application/json");
	headers.append("Content-Type", "application/x-www-form-urlencoded");
	//headers.append("Access-Control-Allow-Origin", "*");
	

	headers.append("authorization", Cookie.get("jwt"));

	let resp_ok = true;

	promise = await fetch(
		route, {
			method: "POST",
			mode: 'cors',
			body: data_to_send,
			headers: headers,
			timeout: 5000
	})
	.then(
		resp => { //SÍ ha sido posible conectar con la API

			//Si todo es correcto (status 200-299)
			if (resp.ok){
				response = resp.json();
				
				//Si todo va bien, podríamos hasta volver a cargar la página para mostrar los nuevos datos! O la vista individual de la publicación
				//location.reload();
			}
			/*else{
				window.alert(resp.statusText);
				return;
			}*/
			
			return response;
		}, 
		resp => { //NO ha sido posible conectar con la API
			window.alert(err_mssg);
			return;
		}
	)
	.then(
		data => {
			//console.log(data);
			//console.log(data["IdAportacio"]);

			if (data === undefined) return;
			
			if (!resp_ok){
				window.alert(data.error);
				return;
			}

			let uploaded_ready = new Array(files_to_add.length).fill(false);
			let deleted_ready = new Array(files_to_delete.length).fill(false);

			let callback_url = window.location.protocol+"//"+window.location.host+(BaseName==="/"?"":BaseName) + 
			(createTupdateF ? 
				"/?sub="+data_to_send.get("sigles_ud") //Pàgina 1 de l'assignatura
			: 
				"/post/"+data["IdAportacio"] //Pàgina individual de la publicació
			);

			var checkFinish = () => {check_if_finished(uploaded_ready, deleted_ready, callback_url);};
			checkFinish();

			var uploadFiles = () => {
				//AÑADIMOS LOS ARCHIVOS UNO A UNO, CADA UNO CON SU PROPIA PETICIÓN
				for (let i = 0; i < files_to_add.length; i++) {
					//console.log(data["IdAportacio"]);
					uploadOrDeleteFile(true, files_to_add[i], data["IdAportacio"], i, uploaded_ready, checkFinish);
				}
			}
			if (files_to_delete.length == 0){uploadFiles();}
			else{
				var checkFinishDel = () => {check_if_finished_deleting(uploaded_ready, deleted_ready, callback_url, uploadFiles);};

				//ELIMINAMOS LOS ARCHIVOS UNO A UNO, CADA UNO CON SU PROPIA PETICIÓN (se hace lo primero, por si acaso alguien pretende subir un fichero con el mismo nombre que uno que se va a eliminar)
				for (let i = 0; i < files_to_delete.length; i++) {
					console.log(data["IdAportacio"]);
					uploadOrDeleteFile(false, files_to_delete[i], data["IdAportacio"], i, deleted_ready, checkFinishDel);
				}
			}

			//console.log(data);
		}
	);
}

function check_if_finished(uploaded_ready, deleted_ready, callback_url){

	console.log(uploaded_ready);
	for (let i = 0; i < deleted_ready.length; i++) {
		if (!deleted_ready[i]) return;
	}
	for (let i = 0; i < uploaded_ready.length; i++) {
		if (!uploaded_ready[i]) return;
	}

	//console.log("SUCCESS!!! Todos los ficheros que debían ser subidos o eliminados lo han sido con éxito!");
	//navigate to callback_url //always ?sub=currentsub
	//navigate(callback_url);
	
	window.location.href = callback_url;
}


function check_if_finished_deleting(uploaded_ready, deleted_ready, callback_url, continue_to_upload_files){

	console.log(uploaded_ready);
	for (let i = 0; i < deleted_ready.length; i++) {
		if (!deleted_ready[i]) return;
	}
	
	continue_to_upload_files();
}










class FitxersInput extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			valid: true,
			err_msg: ""
		};
		this.valid = true;
		this.file_list = [];
	}


	updateFileList(event){
		let file_list = [];
		let max_size_MB = 200;
		let current_size_MB = 0;
		//let max_file_count = 10;

		let files = event.target.files;

		/*if (files.length > max_file_count){
			this.setState({
				valid: false,
				err_msg: ("S'han seleccionat més fitxers que la quantitat màxima permesa d" + ((max_file_count===1)?"'":"e ") + max_file_count + " fitxer" + ((max_file_count===1)?"":"s") + ".")
			});
			this.valid = false;
			return;
		}*/

		for (let i=0; i<files.length; i++){
			let file_size_MB = files[i].size / (1024*1024);

			if ( (current_size_MB + file_size_MB) > max_size_MB){
				this.setState({
					valid: false,
					err_msg: ("Els fitxers afegits superen la mida total màxima permesa de "+max_size_MB+" MB.")
				});
				this.valid = false;
				return;
			}
			else{
				this.valid = true;
				current_size_MB += file_size_MB;
				file_list.push(files[i]);
				//console.log(files[i]);
			}

		}
		this.setState({
			valid: true,
			err_msg: ""
		});
		this.valid = true;


		//console.log(file_list);
		this.file_list = file_list;
		//console.log(this.file_list);
		return;
	}



	render(){
		
		return(
			<>
				<Form.Group 
					className="mt-3 mx-auto"
					size="sm"
				>
					<Form.Label
						className="mb-1"
					size="sm"
					>{"Afegeix fitxers a l'aportació:"}</Form.Label>
					<Form.Control 
					size="sm"
						type="file"
						onChange={(e)=>{this.updateFileList(e); this.props.global_validity_action(true);}} 
						multiple 
						isInvalid={!this.state.valid}
					/>
				<Form.Control.Feedback type="invalid">
					{this.state.err_msg}
				</Form.Control.Feedback>
				</Form.Group>
			</>

		);
	};
}













class SubjectInput extends React.Component {

	constructor(props) {
		super(props);

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

	updateSelected(selected, actionbyuser){
		//this.props.update_assignatura(selected);
		if (actionbyuser){this.hasBeenUsed = true;}
		if (!this.hasBeenUsed || actionbyuser){
			this.current_assignatura = selected;
			this.forceUpdate();
		}
	}






	render(){
		//this.hasBeenUsed = true;

		/*let params = new URLSearchParams(window.location.search);
		let assignatura_search = params.get("sub");
		if (assignatura_search != this.assignatura_search){
			this.hasBeenUsed = false;
			this.assignatura_search = assignatura_search;
		}*/

		let assignatures = this.alphabetize(this.props.subjectList);
		//console.log(assignatures);
		//this.current_assignatura = (this.current_assignatura) ? (this.current_assignatura) : (params.get("sub") ? params.get("sub") : ((assignatures.length!==0) ? assignatures[0].sigles_ud : ""));

		/*this.current_assignatura = this.hasBeenUsed ? 
			this.current_assignatura : assignatura_search;*/

		//this.current_assignatura = ( this.current_assignatura ? this.current_assignatura : ((assignatures.length!==0) ? assignatures[0].sigles_ud : "") );
		this.current_assignatura = ( this.current_assignatura ? this.current_assignatura : (this.props.current_assignatura ? this.props.current_assignatura : ((assignatures.length!==0) ? assignatures[0].sigles_ud : "")) );

		//console.log(this.current_assignatura);
		
		return(
			<InputGroup 
				className="mb-2 mx-auto"
				size="sm"
			>
			<InputGroup.Text
				className="flex-fill"
			>
				Assignatura
			</InputGroup.Text>

			<DropdownButton
				disabled={false}
				className="flex-fill"
				title={this.current_assignatura?this.current_assignatura:(this.hasBeenUsed?"General":"Assignatura")}
				onSelect={(e)=>{this.updateSelected(e, true)}}
			>

				{ assignatures ? 
					assignatures.map((v, k) => { 
					return (
						<>
						<Dropdown.Divider className="my-0" key={k+"_"} />
						<Dropdown.Item key={k}
							eventKey={v.sigles_ud}
							className={(this.current_assignatura===v.sigles_ud)?"current_assignatura":""}
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
			</InputGroup>

		);
	};
}









class TextAreaInput extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			valid: true,
			err_msg: ""
		};
		this.content_txt = "";
		this.valid = true;
		this.titleTbodyF = props.titleTbodyF;
	}


	validate_content_clientside(notify_invalid){

		let content = this.content_txt;
		//console.log("CONTENT: "+content);
		if ((this.titleTbodyF) && (content.length <= 0)){
			if (notify_invalid){
				this.setState({
					valid: false,
					//err_msg: validations[i][regex]
					err_msg: "És necessari un "+(this.titleTbodyF ? "títol." : "cos per a l'aportació")
				});
			}
			this.valid = false;
			return this.valid;
		}
		//Si todo es correcto
		this.setState({
			valid: true,
			err_msg: ""
		});
		this.valid = true;
		return this.valid;
	}


	render(){

		return(

			<>
				<Form.Control
					readOnly={false}
					className={this.titleTbodyF ? "new_title" : "new_body mt-3"} 
					type="text" 
					as="textarea" 
					name={this.titleTbodyF ? "titol" : "body"} 
					placeholder={this.titleTbodyF ? "Un títol interessant i/o descriptiu" : "La meva aportació a ViGtory és..."} 
					defaultValue=""
					onChange={(e) => {this.content_txt=e.currentTarget.value; this.validate_content_clientside(true); this.props.global_validity_action(true);}}
					required 
					rows={this.titleTbodyF ? "2" : "7"} 
					style={this.titleTbodyF ? {fontWeight: 'bold'} : {}}
					isInvalid={!this.state.valid}
				/>
				<Form.Control.Feedback type="invalid">
					{this.state.err_msg}
				</Form.Control.Feedback>
			</>

		);
	};
}






















function ScreenTogglePostEdit({ children, eventKey }){
	const { activeEventKey } = useContext(AccordionContext);
	const switchScreen = useAccordionButton(eventKey, null);

	//console.log(eventKey);
	//console.log(activeEventKey);
	
	return(
		<Button 
			className="interactiveTogglePostEdit"
			onClick={switchScreen}
			size="lg"
			fontWeight="bolder"
		>
			<b>
				<span style={{fontFamily: "monospace", fontSize: "1.5rem"}}>
					{//Ojo, que usamos "–", no "-"; tiene exactamente el mismo ancho que "+"
						((eventKey===activeEventKey)?"–":"+")
					}
				</span>
				{" Nova aportació"}
			</b>
		</Button>
	);
}















class InitialScreen extends React.Component {

	constructor(props) {
		super(props);

		this.state = {allValid: false};

		this.subjectList = [];

		this.subjectInput_ref = React.createRef();

		this.new_title_ref = React.createRef();
		this.new_body_ref = React.createRef();
		this.ref_list = [this.new_title_ref, this.new_body_ref];

		this.fitxersInput_ref = React.createRef();
	}




	checkLocalValidity(notify_invalid){
		let valid = true;
		valid = this.fitxersInput_ref.current ? this.fitxersInput_ref.current.valid : false;
		for (let i=0; i<this.ref_list.length && valid; i++){
			//valid = this.ref_list[i].current.state.valid && (this.ref_list[i].current.content_txt !== "");
			valid = this.ref_list[i].current.validate_content_clientside(notify_invalid)/*&& (this.ref_list[i].current.content_txt !== "")*/;
			//console.log("VALID "+i+": "+valid);
			//console.log(this.ref_list[i].current.content_txt);
		}
		//console.log(this.password_ref.current.pwd_txt);
		//valid=true;//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		this.setState({allValid: valid});
		//console.log(this.getCurrentEditedData());
		return valid;
	}


	updateSubjectList(data){
		this.subjectList = data.assignatures;
		this.forceUpdate();
	}


	updateSelected(selected){
		if (this.subjectInput_ref.current)
		this.subjectInput_ref.current.updateSelected(selected, false);
	}





	getCurrentEditedData(){
		let data = {};

		if (this.subjectInput_ref.current && this.subjectInput_ref.current.current_assignatura)
			data["sigles_ud"] = this.subjectInput_ref.current.current_assignatura;

		//if (this.new_title_ref.current && this.new_title_ref.current.content_txt)
		//	data["titol"] = this.new_title_ref.current.content_txt;
		//if (this.new_body_ref.current && this.new_body_ref.current.content_txt)
		//	data["body"] = this.new_body_ref.current.content_txt;

		if (this.new_title_ref.current)
			data["titol"] = this.new_title_ref.current.content_txt ? this.new_title_ref.current.content_txt : "";
		if (this.new_body_ref.current)
			data["body"] = this.new_body_ref.current.content_txt ? this.new_body_ref.current.content_txt : "";
		
		return data;
	}





	submitButtonAction(event){
		event.preventDefault();
		if (!this.checkLocalValidity(true)){
			alert("Tots els camps han de ser omplerts correctament.");
			return; //Para evitar que la gente trastee con el HTML
		}
		//console.log(new FormData(event.currentTarget));

		//console.log("fitxersInput_ref: "+this.fitxersInput_ref.current);
		//console.log("fitxersInput_ref.file_list: "+this.fitxersInput_ref.current.file_list);
		let files_to_add = (this.fitxersInput_ref.current) ? (this.fitxersInput_ref.current.file_list?this.fitxersInput_ref.current.file_list:[]) : ([]);
		let files_to_delete = [];

		createOrUpdatePostToAPI(
			this.props.new_post,
			this.getCurrentEditedData(),
			(API_address + "/aportacio/" + "newAportacio"),
			files_to_add,
			files_to_delete//,
			//this.props.navigate
		);

	}




	render(){

		this.new_title = <TextAreaInput ref={this.new_title_ref} global_validity_action={(notify_invalid) => this.checkLocalValidity(notify_invalid)} titleTbodyF={true} />

		this.new_body = <TextAreaInput ref={this.new_body_ref} global_validity_action={(notify_invalid) => this.checkLocalValidity(notify_invalid)} titleTbodyF={false} />


		this.subjectInput = <SubjectInput subjectList={this.subjectList} current_assignatura={this.props.current_assignatura} ref={this.subjectInput_ref} />;

		this.fitxersInput = <FitxersInput ref={this.fitxersInput_ref} global_validity_action={(notify_invalid) => this.checkLocalValidity(notify_invalid)}/>;


		//<Card.Title>Card Title</Card.Title>
		//<Card.Subtitle className="mb-2 text-muted">Card Subtitle</Card.Subtitle>
		//<Popover><Popover.Body>
		//<Card.Link href="#">Card Link</Card.Link>
		//Link a perfil de usuario




/*



<Accordion defaultActiveKey={"accord_"+this.props.currentSection}>

<SettingsNav currentSection={this.props.currentSection} />
<br/>

<div className="content">

	<Accordion.Collapse eventKey="accord_postedit" >
		<div>
			<div className="content_wrapper">
			<UsernameForm validation_rgx_msg={validation_rgx_msg} defaultValue={"nomdusuariactual"} />
			</div>
		</div>
	</Accordion.Collapse>

</div>

</Accordion>


*/








		return(
			<>

			<Accordion className="mb-4" defaultActiveKey={(this.props.new_post ? "" : "accord_post_edit")}>


				{this.props.new_post ? 
				<p className="text-center" style={{marginBottom: "-1.25rem", zIndex: "6", position: "relative"}} >
					<ScreenTogglePostEdit eventKey={"accord_post_edit"}/>
				</p>
				:""
				}

				<Accordion.Collapse eventKey="accord_post_edit" style={{zIndex: "5", position: "relative"}} >
				<div>




				<Card className="mx-auto post_edit assignatura_selector" >
					<Card.Body>
						
					
						<Form noValidate method="post" action="http://httpbin.org/post" onSubmit={(e) => this.submitButtonAction(e)} >
					
							<div className="mt-0 mb-3">
								<Card.Title className="d-inline">
									{this.props.new_post ? ""/*"Nova aportació:"*/ : "Modifica la teva aportació:"}
								</Card.Title>
							</div>



							{this.subjectInput}
							{this.new_title}
							{this.new_body}
							{this.fitxersInput}
								

							<p className="text-center mb-0" ><Button type="submit" className="mt-4" disabled={!this.state.allValid}>Publica aportació</Button></p>






						</Form>

					</Card.Body>
				</Card>
					
				


				</div>
				</Accordion.Collapse>
			</Accordion>

			</>
		);

	};
}






function PostEdit(props){


	let navigate = useNavigate();
	function navigateTo(page) {
		navigate(page);
	}


	//let screen_ref = React.createRef();
	//let screen = <InitialScreen post_info={props.post_info} new_post={props.new_post} ref={screen_ref} current_assignatura={props.current_assignatura} />
	let screen_ref = props.postedit_ref ? props.postedit_ref : React.createRef();
	let screen = <InitialScreen post_info={props.post_info} new_post={props.new_post} ref={screen_ref} current_assignatura={props.current_assignatura} navigate={navigateTo} />




	useEffect(() => {
		
		getSubjectList().then((data) => {
			//console.log(data);
			if (screen_ref.current){
				screen_ref.current.updateSubjectList(data);
				screen_ref.current.checkLocalValidity(false);
			}
		});
		//console.log("USE EFFECT");
		//quiero que cada vez que se ejecute una búsqueda o cambio de página, cambie la asignatura seleccionada para que corresponda con lo que sea que haya en los criterios de búsqueda :c
		

	}, []);




	return(
		<>
			{screen}
		</>
	)
}
export default PostEdit;