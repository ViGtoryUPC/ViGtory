import React, { useImperativeHandle } from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import {API_address} from '../libraries/API_address';
//import ReactDOM from 'react-dom';
import { Routes, Route, Link, useHistory, useNavigate } from "react-router-dom";

import { Accordion, Button, ButtonGroup, Form, FloatingLabel, Table, Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';

import NavBar from "../components/NavBar";

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/GradeCalc.css';

import { Cookie } from '../libraries/cookie';
import {BaseName} from "../libraries/basename";
import { user_validity_check_per_route } from "../libraries/user_validity_check_per_route"
import {getSubjectList} from '../libraries/data_request';

//IMPORTANTE PARA QUE NO SE VEA MAL AL ABRIR EL TECLADO EN MÓVIL
//https://stackoverflow.com/questions/32963400/android-keyboard-shrinking-the-viewport-and-elements-using-unit-vh-in-css
var viewport = document.querySelector("meta[name=viewport]");
viewport.setAttribute("content", viewport.content + ", height=" + window.innerHeight);









class MagicInput extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
		};

		//this.inherited_height = 0;
		//this.inherited_width = 0;

		this.readTeditF = true;
		this.read_ref = React.createRef();
		this.text_ref = React.createRef();
		this.edit_ref = React.createRef();
		this.type = this.props.type ? this.props.type : "text"; //o "number"
		this.extra_str = this.props.extra_str ? this.props.extra_str : ""; //%

		this.min = this.props.min ? this.props.min : 0;
		this.max = this.props.max ? this.props.max : 100;
		this.step = this.props.step ? this.props.step : 0.1;

		this.value = (this.props.original_value!=undefined) ? this.props.original_value : "";
		this.updateFunc = this.props.updateFunc ? this.props.updateFunc : (v)=>{};

		this.showEditable = (this.props.showEditable!=undefined) ? this.props.showEditable : true;
		this.editableIndicator = <span className="small" style={{fontSize:"0.60rem", position:"relative", bottom:"0.1rem"}}>✏️</span>;



		this.text_height = 0;
		this.text_width = 0;
		this.gotSizesFirstTime = false;

		this.isTitle = this.props.isTitle ? this.props.isTitle : false;

	}



	manageEditableIcon(){
		let v = this.value;
		if (this.type == "number") v = this.value.toString();
		if (v.length == 0) this.showEditable = true;
		else this.showEditable = (this.props.showEditable!=undefined) ? this.props.showEditable : true;
	}


	
	changeValueRemotely(value){
		if (this.type == "number"){
			value = Math.max(this.min, value);
			value = Math.min(this.max, value);
		}
		if (this.type == "text"){
			value = value.slice(0, this.max);
		}
		this.value = value;
		this.manageEditableIcon();

		//this.getTextSpanSizes();
		this.gotSizesFirstTime = false;

		this.updateFunc(this.value);
		
		//this.forceUpdate();
	}




	focus(){
		if (this.edit_ref.current){
			this.edit_ref.current.focus();
		}
	}
	/*select(){
		if (this.edit_ref.current){
			this.edit_ref.current.select();
		}
	}*/

	changeToEditMode(){
		setTimeout(()=>{
			this.readTeditF = false;
			this.forceUpdate();
		},10);

		setTimeout(()=>{
			this.focus();
		},20);

		/*setTimeout(()=>{
			this.select();
		},30);*/
	}
	changeToReadMode(){
		if (this.value === ""){
			setTimeout(()=>{
				//if (e.currentTarget.value == ""){e.currentTarget.value = "???"}
					this.value = "???";
					this.manageEditableIcon();
					this.getTextSpanSizes();
					this.updateFunc(this.value);
			},10);
		}
		
		setTimeout(()=>{
			this.readTeditF = true;
			this.forceUpdate();
		},30);
	}
	cleanTrailingSpace(e){
		//Limpieza de texto (eliminamos espacios finales que sobren)

		e.currentTarget.value = e.currentTarget.value.replace(/\s+$/,"");
		this.value = e.currentTarget.value;
	}


	getTextSpanSizes(){
		setTimeout(()=>{
			if (this.read_ref.current){
				//this.read_ref.current.style.display = "inline";
				this.read_ref.current.style.visibility = "visible";
				this.read_ref.current.style.position = "static";
			}
			this.forceUpdate();
		},1);

		setTimeout(()=>{
			let height = this.text_ref.current ? this.text_ref.current.offsetHeight : 0;
			let width = this.text_ref.current ? this.text_ref.current.offsetWidth : 0;
			if (this.type == "number"){
				this.text_height = height;
				this.text_width = Math.max(width, this.text_width);
			}
			else{
				this.text_height = height;
				this.text_width = width;
			}
		},2);

		setTimeout(()=>{
			if (this.read_ref.current){
				//this.read_ref.current.style.display = "none";
				this.read_ref.current.style.visibility = "hidden";//
				this.read_ref.current.style.position = "absolute";//
			}
			//console.log(this.text_height, this.text_width);
			this.forceUpdate();
		},3);
	}


	spacingCleanup(e){
		//Limpieza de texto (eliminamos espaciados duplicados; finales no porque el user debería poder separar sus palabras con espacios)

		if (this.type == "text"){
			if (
				e.currentTarget.value.match(/(\r\n|\n|\r|\t|\s+)/gm)
				||
				e.currentTarget.value.match(/\s+$/)
			){
				let previous_value = e.currentTarget.value;
				let selectionStart = e.currentTarget.selectionStart;

				e.currentTarget.value = 
					e.currentTarget.value
						.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ")
						.replace(/\s+$/," ");
						
				let previous_char_code = previous_value.charAt(selectionStart-1).charCodeAt();
				let new_char_code = e.currentTarget.value.charAt(selectionStart-1).charCodeAt();
				console.log(new_char_code);
				/*if (need_recoil && (char_code == 32)) selectionStart-=1;*/
				if (previous_value.match(/(\r\n|\n|\r|\t|\s+)/gm) && (new_char_code != 32) && (previous_char_code != new_char_code)) selectionStart-=1;

				e.currentTarget.selectionStart = selectionStart;
				e.currentTarget.selectionEnd = e.currentTarget.selectionStart;
			}
		}
	}

	changeValueLocally(e){
		if (this.type == "number"){
			e.currentTarget.value = Math.max(this.min, e.currentTarget.value);
			e.currentTarget.value = Math.min(this.max, e.currentTarget.value);
		}
		if (this.type == "text"){
			this.spacingCleanup(e);
			e.currentTarget.value = e.currentTarget.value.slice(0, this.max);
		}

		//if (e.currentTarget.value == ""){e.currentTarget.value = "???"}

		this.value = e.currentTarget.value;
		this.manageEditableIcon();
		this.getTextSpanSizes();
		this.updateFunc(this.value);
	}





	render(){
		//this.inherited_height = 0;
		//console.log(this.value);

		/*if (this.read_ref.current) this.inherited_height = (this.read_ref.current.offsetHeight > 0) ? this.read_ref.current.offsetHeight : this.inherited_height;*/ //Este era el bueno antes del cambio

		//else if (this.edit_ref.current) this.inherited_height = (this.edit_ref.current.offsetHeight > 0) ? this.edit_ref.current.offsetHeight : this.inherited_height;

		//if (this.read_ref.current) this.inherited_width = (this.read_ref.current.offsetWidth > 0) ? this.read_ref.current.offsetWidth : this.inherited_width;


		/*let width = ( 
			(
				this.inherited_height
			*
				(
					(this.type == "number") ? 
						((this.max-1).toString().length + 3)
						:
						(this.value.length)
				)*0.5
			)//.toString()+"px"
		);*/
		//if (!this.readTeditF) console.log("Width:        "+width);
		//if (!this.readTeditF) console.log("Parent width: "+this.inherited_width); 

		/*let top = this.text_ref.current ? this.text_ref.current.getBoundingClientRect().top : 0;
		let left = this.text_ref.current ? this.text_ref.current.getBoundingClientRect().left : 0;
		if (!this.readTeditF)console.log(top,left);*/

		
		//let lineHeight = this.text_ref.current ? this.text_ref.current.lineheight : 0;
		//if (!this.readTeditF)console.log(lineHeight);





		let lineHeight = "1.2";
		//let height = this.text_ref.current ? this.text_ref.current.offsetHeight : 0;
		//let width = this.text_ref.current ? this.text_ref.current.offsetWidth : 0;

		//this.getTextSpanSizes();
		//let height = this.text_height;
		//let width = this.text_width;
		
		let height = 0;
		let width = 0;
		if (!this.readTeditF){
			if (!this.gotSizesFirstTime){
				height = this.text_ref.current ? this.text_ref.current.offsetHeight : 0;
				width = this.text_ref.current ? this.text_ref.current.offsetWidth : 0;
				if (height!=0){
					//console.log(height, width);
					this.gotSizesFirstTime = true;
				}
			}
			else{
				height = this.text_height;
				width = this.text_width;
			}
		}
		let max_span_width = 0;
		if (this.props.colwidth_ref && this.props.colwidth_ref.current){
			//console.log(this.props.colwidth_ref.current.offsetWidth);
			//FORMA ALTERNATIVA DE CONSEGUIR LA ANCHURA ***MÁXIMA*** DE LA COLUMNA
			max_span_width = this.props.colwidth_ref.current.offsetWidth;
		}
		if (max_span_width == 0){max_span_width = width;}
		//if (max_span_width > 5){max_span_width -= 5;}


		let plusPX = (this.type == "number") ? 15 : 5;
		//height+=plusPX;
		width+=plusPX;



		return(<>
			<div
				ref={this.read_ref}
				className="magic_input_read d-inline"
				style={this.readTeditF ?
						{
							//visibility: "visible",////
							//position: "default",
							//display: "block"
							opacity: "inherit"
						}
					:
						{
							//display: "none",

							opacity: "0%",
							visibility: "hidden",
							position: "absolute",



							/*position: "absolute",
							top:"0",
							left:"0",*/
							/*position: "relative",
							top:"999999px",
							left:"999999px",
							maxWidth:"inherit",
							width:"inherit",*/

							/*paddingLeft: "inherit",
							paddingRight: "inherit",
							position: "absolute",
							left: "0",
							right: "0",*/

							/*position: "absolute",
							width:"auto",*/

							
						}
				}
				onClick={()=>{
					this.changeToEditMode();
				}}
			>
				<span ref={this.text_ref} className="d-inline" 
					style={{
						minWidth: "200px !important",
						maxWidth: max_span_width.toString()+"px !important",
						lineHeight: lineHeight,
						whiteSpace: "pre-wrap",
						zIndex: "33"
					}}
				>
					{(this.type == "number") ? this.value.toString().replace(".",",") : this.value}
				</span>
				{this.extra_str}
				{this.showEditable?this.editableIndicator:""}&nbsp;
			</div>


			{this.readTeditF ? <></>:<>


				<Form.Control
					autoFocus
					size="sm"
					className="m-0 px-0 pb-0 pt-0 d-inline shadow-none"
					style={{
						textAlign:"inherit",
						//wordWrap:"break-word",
						//whiteSpace:"pre-line",

						//minWidth:"0",
						//width:"75%",
						//maxWidth:this.inherited_width.toString()+"px",
						//width:width.toString()+"px",
						//width:Math.min(width, this.inherited_width).toString()+"px",
						//maxWidth:"10px",
						//width:"fit-content",
						//width:width.toString()+"px",////
						//minWidth:(Math.max(width, "25")).toString()+"px",///////
						maxWidth:(this.type=="number" ? width.toString()+"px" : (Math.max(max_span_width, "25")).toString()+"px"),
						minWidth:(this.type=="number" ? width.toString()+"px" : (Math.max(width, "25")).toString()+"px"),
						//width:max_span_width.toString()+"px",///////
						width:(this.type=="number" ? width.toString()+"px" : max_span_width.toString()+"px"),

						minHeight:"10px",
						//height:"inherit",
						height:height.toString()+"px",
						//height:"auto",

						backgroundColor:"rgba(255,255,255,0)",
						border:"none",
						color: "inherit",
						fontSize: "inherit",
						fontWeight: "inherit",
						//overflowX: "visible",
						overflowY: "hidden",
						//overflowY: "visible",
						//lineHeight: (lineHeight/2)+"px"
						//lineHeight: lineHeight.toString()
						lineHeight: lineHeight,
						resize: "none",
						marginLeft:"0.2rem",
						marginRight:"0.2rem",
						//paddingTop:"0.25rem",
						//position: this.readTeditF ? "default" : "relative",
						zIndex: "999",
						backgroundColor:"inherit"
					}}


					ref={this.focusRef}

					type={this.type}
					as={this.type=="text" ? (this.isTitle ? "input" : "textarea") : "input"}

					min={this.min}
					max={this.max}
					step={this.step}

					maxLength={this.max}

					defaultValue={this.value}

					onKeyUp={(e)=>{
							//console.log(e.target.value)
							//console.log(e)
						//alert(e.key + "_" + e.keyCode)
						//229 es el código que equivaldría en Android al Shift+Enter de PC
						//Como hace cosas raras, haremos que los users solo puedan introducirlo mediante copia-pega (total, tampoco lo deberían a necesitar)
						//LO RETIRO :)))) 229 viene delante de todos y cada uno de los carácteres que se pulsen en android :))))))))
						//if (e.keyCode === 229) return;



						/*
						if ((e.key === 'Enter' || e.keyCode === 13 
							//|| e.keyCode === 229
						) && (!e.shiftKey)
							// && (e.key !== "Unidentified")
						){
							this.gotSizesFirstTime = false;
							this.changeToReadMode();
						}
						//console.log(e.currentTarget.value);
						else{
							this.changeValueLocally(e);
						}
						*/

						if (this.type == "number" || (this.isTitle) || ((this.type == "text" && (e.currentTarget.value.length >= this.max)))){
							if (e.key === 'Enter'){
								this.gotSizesFirstTime = false;
								this.changeToReadMode();
							}
						}
					}}
					onPaste={(e)=>{
						this.changeValueLocally(e);
					}}
					onChange={(e)=>{
						
						//Estos inputs son monolínea y no necesitan más que este tratado
						if (this.type == "number" || (this.isTitle)){
							this.changeValueLocally(e);
							return;
						}

						//if (this.type == "text" || (!this.isTitle))
						//console.log(e.target.value.charAt(e.target.selectionStart-1).charCodeAt())
						let key_code = e.currentTarget.value.charAt(e.currentTarget.selectionStart-1).charCodeAt();
						//console.log(key_code);

						if (key_code === 10){
							e.currentTarget.value = this.value;
							this.gotSizesFirstTime = false;
							this.cleanTrailingSpace(e);
							this.changeToReadMode();
						}
						else{
							this.changeValueLocally(e);
						}

						/*this.value = e.currentTarget.value;
						this.manageEditableIcon();
						this.getTextSpanSizes();
						this.updateFunc(this.value);*/




						/*
							if (this.type == "number"){
								e.currentTarget.value = Math.max(this.min, e.currentTarget.value);
								e.currentTarget.value = Math.min(this.max, e.currentTarget.value);
							}
							if (this.type == "text"){
								e.currentTarget.value = e.currentTarget.value.slice(0, this.max);
							}
							this.value = e.currentTarget.value;
							this.manageEditableIcon();
							this.getTextSpanSizes();
							this.updateFunc(this.value);
							//this.forceUpdate();
					*/
						//if (this.type == "number") this.changeValueLocally(e);//////////

						/*else{
							console.log(e.target.value)
						}*/
					
					}}
					onBlur={(e)=>{
						this.gotSizesFirstTime = false;
						this.cleanTrailingSpace(e);
						this.changeToReadMode();
					}}
					onFocus={(e)=>{
						//e.currentTarget.select(); //Con currentTarget no selecciona el texto en Android
						setTimeout(()=>{e.target.select();}, 50); //El timeout es necesario por si una pantalla táctil detecta 2 pulsaciones muy seguidas que el usuario consideraría una sola
					}}
				/>{this.extra_str}



			</>}




		</>);
	}






}

















class TaulaCalcul extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
		};
		
		this.maxRows = 50;
		this.notaMax = 10;

		this.taula_nom_ref = React.createRef();
		let taula = this.props.main_ref.current ? this.props.main_ref.current.taules[this.props.index] : 
		{
			nom:"???",
			calculs:[]
		};
		this.row_keys = [];

		this.row_noms_refs = [];
		for (let i=0; i<taula.calculs.length; i++){
			this.row_noms_refs.push(React.createRef());
			this.row_keys.push(this.props.index+"_"+i+"_"+new Date());
		}
		//this.title = <MagicInput ref={this.taula_nom_ref} key={taula.nom} original_value={taula.nom} max={16} updateFunc={(v)=>{taula.nom=v; this.forceUpdate()}} showEditable={false} />

		this.colwidth_refs = [...Array(5)].map(_=>React.createRef());
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

	

	title_selector(){
		let taula = this.props.main_ref.current ? this.props.main_ref.current.taules[this.props.index] : 
		{
			nom:"???",
			calculs:[]
		};
		//let assignatures = this.alphabetize(this.props.main_ref.current.subjectList.assignatures);
		let assignatures = this.alphabetize(this.props.main_ref.current ? this.props.main_ref.current.subjectList.assignatures : []);

		return(<>

		 
			<DropdownButton
				key={"dropdownbutton"}
				className="d-inline"
				size="sm"
				title={""}
				onSelect={(e)=>{
					//taula.nom = e;
					this.taula_nom_ref.current.changeValueRemotely(e);
					//console.log(taula.nom);
				}}
			>

				{ assignatures ? 
					assignatures.map((v, k) => { 
					return (
						<>
						{k==0 ? "" : <Dropdown.Divider className="my-0" key={k+"_"} /> }
						<Dropdown.Item key={k}
							eventKey={v.sigles_ud}
							className={(taula.nom===v.sigles_ud)?"current_selection":""}
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

		</>);
	}


	
	name_selector(index){
		let taula = this.props.main_ref.current ? this.props.main_ref.current.taules[this.props.index] : 
		{
			nom:"???",
			calculs:[]
		};
		let row_name = (index>=0) ? taula.calculs[index] : "";
		//let row = taula.calculs[index];

		let parts = this.props.main_ref.current.partList;
		parts = parts.map(p => {

			let part = p[0];

			if (part[part.length-1] == "X"){
				let existing_parts = taula.calculs
				.filter(ro => {
					//return (ro.nom).match(".*\\d+$") ? true : false;
					return (ro.nom).match("^"+part.split("X")[0]+"\\d+$") ? true : false;
				})
				.map(ro => {
					return parseInt(ro.nom.match("\\d+$")[0]);
				})
				existing_parts.push(0);
				existing_parts = [...new Set(existing_parts)].sort((a,b)=>a-b)
				
				//console.log(existing_parts);

				let lowest = -1;
				for (let i = 0;  i < existing_parts.length;  ++i) {
					if (existing_parts[i] != i) {
						lowest = i;
						break;
					}
				}
				if (lowest == -1) {
					lowest = existing_parts[existing_parts.length - 1] + 1;
				}

				let new_p = [...p];
				new_p[0] = part.split("X")[0]+lowest;
				return new_p;
			}

			else return p;

		})


		return(<span className="part_selector">

			<DropdownButton
				key={"dropdownbutton"}
				className="d-inline align-top"
				size="sm"
				title={""}
				onSelect={(e)=>{
					let v = JSON.parse(e);
					//row.nom = e;
					//this.forceUpdate();
					if (index >= 0)
						this.row_noms_refs[index].current.changeValueRemotely(v[0]);
					else{
						this.addRowAndUpdate(
							{
								nom: v[0],
								percentatge: v[2] ? v[2] : 0,
								nota: 5,
								confianca: 100,
								objectiuTassolitF: true
							}
						);
					}
				}}
			>

				{ parts ? 
					parts.map((v, k) => { 
					return (
						<>
						{k==0 ? "" : <Dropdown.Divider className="my-0" key={k+"_"} /> }
						<Dropdown.Item key={k}
							eventKey={JSON.stringify(v)}
							className={(row_name===v[0])?"current_selection":""}
						>
							<span style={{whiteSpace:"nowrap", fontWeight:(v[1]?"bold":"normal")}}>
								{((!v[1])?<>&nbsp;&nbsp;-&nbsp;</>:"")}{v[0]}
							</span>
						</Dropdown.Item>
						</>
					)
				} ) : "" }
				
			</DropdownButton>

		</span>);
	}

	addRowAndUpdate(row_info){
		let taula = this.props.main_ref.current ? this.props.main_ref.current.taules[this.props.index] : 
		{
			nom:"???",
			calculs:[]
		};

		taula.calculs.push(row_info);
		this.row_noms_refs.push(React.createRef());
		this.row_keys.push(this.props.index+"_"+(taula.calculs.length-1)+"_"+new Date());
		this.forceUpdate();
	}



	confirmDeleteTable(){
		return(
			window.confirm(
				"Segur que vols eliminar la taula actual?"+
				"\n  Taula "+//(this.props.index+1)+
				(this.props.main_ref.current.taules[this.props.index].nom ? ": "+this.props.main_ref.current.taules[this.props.index].nom 
				:"sense nom")
			)
		);
	}


	eliminaTaula(needConfirm){
		if (!needConfirm || this.confirmDeleteTable()){
			this.props.main_ref.current.taules.splice(this.props.index, 1);
			this.props.main_ref.current.taules_ref.splice(this.props.index, 1);
			if (this.props.main_ref.current) this.props.main_ref.current.saveChanges();
			this.props.main_ref.current.forceUpdate();
		}
	}

	eliminaFila(i){
		let taula = this.props.main_ref.current ? this.props.main_ref.current.taules[this.props.index] : 
		{
			nom:"???",
			calculs:[]
		};
		//let row = taula.calculs[index];

		if ((taula.calculs.length-1) == 0)
		if (!this.confirmDeleteTable()) return;

		taula.calculs.splice(i, 1);
		this.row_keys.splice(i, 1);
		if (taula.calculs.length == 0) this.eliminaTaula(false);
		else this.forceUpdate();
	}

	moveRowFromIndexToIndex(i_orig, i_dest){
		let taula = this.props.main_ref.current ? this.props.main_ref.current.taules[this.props.index] : 
		{
			nom:"???",
			calculs:[]
		};
		let row = {...taula.calculs[i_orig]};

		taula.calculs.splice(i_orig, 1);
		taula.calculs.splice(i_dest, 0, row);

		this.row_keys = [];
		this.row_noms_refs = [];
		for (let i=0; i<taula.calculs.length; i++){
			this.row_noms_refs.push(React.createRef());
			this.row_keys.push(this.props.index+"_"+i+"_"+new Date());
		}
	}


	orderRowsByName(ascTdescF){
		let taula = this.props.main_ref.current ? this.props.main_ref.current.taules[this.props.index] : 
		{
			nom:"???",
			calculs:[]
		};
		let orderator = ascTdescF ? 1 : -1;

		taula.calculs = taula.calculs.sort((a,b)=>{

			//let parts = [...this.props.main_ref.current.partList];
			//let some_funct = (part, name)=>{
			//	return (name).match("^"+part.split("X")[0]+"\\d+$") ? true : false;
			//}
			//Podría haberse hecho con some en vez de filter, pero con filter, de paso, nos queda más a mano la parte que haya correspondido, si la hay... Por si acaso
			//parts = (parts.filter(part =>{return some_funct(part, a.nom) && some_funct(part, b.nom)}))
			//let same_and_end_in_num = false;
			let same_text = false;
			same_text = 
				//(a.nom.match("\\d+$") && b.nom.match("\\d+$"))
				//&&
				(a.nom.replace(/\d+$/, "") == b.nom.replace(/\d+$/, ""))
			;

			//if (parts.length > 0){
			if (same_text){
				//console.log("SAME TEXT");
				let a_num = a.nom.match("\\d+$") ? parseInt(a.nom.match("\\d+$")[0]) : 0;
				let b_num = b.nom.match("\\d+$") ? parseInt(b.nom.match("\\d+$")[0]) : 0;

				if ( a_num < b_num ){
					return -1*orderator;
				}
				if ( a_num > b_num ){
					return 1*orderator;
				}
				return 0;
			}

			if ( a.nom < b.nom ){
				return -1*orderator;
			}
			if ( a.nom > b.nom ){
				return 1*orderator;
			}

			return 0;
		});

		this.row_keys = [];
		this.row_noms_refs = [];
		for (let i=0; i<taula.calculs.length; i++){
			this.row_noms_refs.push(React.createRef());
			this.row_keys.push(this.props.index+"_"+i+"_"+new Date());
		}
	}




	changeAttr(json, attr, val){
		let j = {...json};
		j[attr] = val;
		return j;
	}

	render(){
		let taula = this.props.main_ref.current ? this.props.main_ref.current.taules[this.props.index] : 
		{
			nom:"???",
			calculs:[]
		};



		let header_style = {backgroundColor:"#3488bb", color:"white", width:"auto", /*border:"1px solid #30577b",*/ width:"75%"};

		let nota_final = taula.smartTmanualF ? taula.notaFinal : taula.calculs.reduce((sum, val)=>{return sum+(val.nota*val.percentatge/100)}, 0);

		//Capamos la nota a 10 porque aunque se pueda sacar más (si el profesor lo permite), en el expediente quedará a 10 como máximo
		nota_final = Math.min(10, nota_final);

		if (!taula.smartTmanualF){
			nota_final = (nota_final.toFixed(2)%1 > 0) ? nota_final.toFixed(2) : nota_final.toFixed(0);

			taula.notaFinal = nota_final;
		}


		if (taula.smartTmanualF){

			let assolit = taula.calculs.reduce(
				(sum, row)=>
					sum + (row.objectiuTassolitF ? 0 : row.nota*(parseFloat(row.percentatge)/100))
			, 0).toFixed(2);
			//console.log(taula.calculs);
			/*console.log(assolit);
			console.log(taula.notaFinal);*/

			let percentatge_no_assolit = taula.calculs.reduce(
				(sum, row)=>
					sum + (row.objectiuTassolitF ? parseFloat(row.percentatge) : 0)
			, 0).toFixed(2);

			taula.calculs.map((row, i) => {
				if (row.objectiuTassolitF){
					if((parseFloat(assolit) >= parseFloat(taula.notaFinal)) || (row.percentatge==0)){
						row.nota = 0;
						return;
					}

					row.nota = Math.min(this.notaMax, 
						(taula.notaFinal-assolit)
						*
						(
							(row.percentatge/(percentatge_no_assolit>0?percentatge_no_assolit:0.0001))
							/
							(row.percentatge/100)
						)
						*
						(
							100
							/
							( (row.confianca==0)? 0.0001 : row.confianca )
						)
					);

					row.nota = (row.nota.toFixed(2)%1 != 0) ? row.nota.toFixed(2) : row.nota.toFixed(0);
				}
			})
		}

		let percentatge_total = taula.calculs.reduce(
			(sum, row)=>
				sum + parseFloat(row.percentatge)
		, 0);
		//console.log(percentatge_total);
		percentatge_total = (percentatge_total.toFixed(2)%1 != 0) ? percentatge_total.toFixed(2) : percentatge_total.toFixed(0);



		if (this.props.main_ref.current) this.props.main_ref.current.saveChanges();
		return(<>
			<div className="d-flex justify-content-between">
				<h5 className="mb-0 px-2 pt-1 pb-1" style={/*taula.nom.length>0 ?*/ {backgroundColor:"rgba(11,94,215,1)", color:"white", borderTopLeftRadius:"0.5rem", borderTopRightRadius:"0.5rem"} /*: {}*/}>
					<Button
						className="me-1 py-0 px-1 btn-danger"
						size="sm"
						onClick={()=>{
							this.eliminaTaula(true);
						}}
					>
						<b className="py-0">
							<span style={{fontFamily: "monospace", fontSize: "1rem"}}>✖</span>
						</b>
					</Button>

					{
						//taula.nom ? <br/>:""
						<br/>
					}

					<b>
						{
						<MagicInput ref={this.taula_nom_ref} /*key={taula.nom}*/ original_value={taula.nom} max={16} updateFunc={(v)=>{taula.nom=v; this.forceUpdate()}} showEditable={false} isTitle={true} />
						//this.title
						}
						{this.title_selector()}
					</b>
				</h5>


				<Button
					className="py-0 px-1 me-3 mb-1 small align-self-end"
					size="sm"
					style={{height:"fit-content"}}
					onClick={()=>{
						taula.smartTmanualF = !(taula.smartTmanualF);
						this.forceUpdate();
					}}
				>
						<h6 className="d-inline">{taula.smartTmanualF ? "☑":"☐"}</h6>
						&nbsp;
						<span className="small" >{"Mode intel·ligent"}</span>
				</Button>
			</div>
			


			<Table className="mb-0" style={{tableLayout:"fixed", width:"100%", borderCollapse:"collapse", borderStyle:"none !important", borderBottomLeftRadius:"0.75rem", borderTopRightRadius:"0.75rem !important", overflowX:"hidden"}}>

				<thead>
					<tr>
						<th className="pe-0" style={this.changeAttr(header_style, "width", taula.smartTmanualF ?"28%":"48%")} ref={this.colwidth_refs[0]}>
							<div className="d-flex justify-content-between align-items-end">
								<span>{"Part" /*"Criteri"*/ /*"Activitat"*/ /*"Avaluable"*/ }</span>


								<ButtonGroup >
										<Button
											className="py-0 px-1 btn-light up_down_order"
											size="sm"
											onClick={()=>{
												this.orderRowsByName(true);
												this.forceUpdate();
											}}
										>
											<b className="py-0">
												<span style={{fontFamily: "monospace", fontSize: "1rem"}}>▲</span>
											</b>
										</Button>


										<Button
											className="py-0 px-1 btn-light up_down_order"
											size="sm"
											onClick={()=>{
												this.orderRowsByName(false);
												this.forceUpdate();
											}}
										>
											<b className="py-0">
												<span style={{fontFamily: "monospace", fontSize: "1rem"}}>▼</span>
											</b>
										</Button>

								</ButtonGroup >
							</div>


						</th>


						<th className="text-center" style={this.changeAttr(header_style, "width", "20%")} ref={this.colwidth_refs[1]}>
							{"Percent"}
						</th>

						{taula.smartTmanualF ? 

							<th className="text-center" style={this.changeAttr(header_style, "width", "17%")} ref={this.colwidth_refs[2]}>

								<OverlayTrigger
									overlay={
										<Tooltip className="text-center mb-2" style={{zIndex: "999999999"}}>
											{"La confiança que tens en treure exactament (o més) la nota que et proposem."}
											<br/><br/>
											{"Si, per exemple, amb la confiança al 100% necessitessis un 4; amb la confiança al 50% t'hauries d'esforçar com per a aconseguir un 8."}
										</Tooltip>
									}
									>


									<span style={{borderBottom:"1px dotted"}/*{textDecoration:"underline dotted"}*/} >
										{"Confiança"}
									</span>


								</OverlayTrigger>

							</th>
						:""}
						

						<th className="text-center" style={this.changeAttr(header_style, "width", "20%")} ref={this.colwidth_refs[4]}>
							{"Objectiu"}
						</th>


						<th style={this.changeAttr(
									this.changeAttr(header_style, "width", "15%")
									,"borderTopRightRadius", "0.75rem"
									)} ref={this.colwidth_refs[5]}>
							{"Nota"}
						</th>

					</tr>
				</thead>


				<tbody>
					{taula.calculs.map((row, i) => {return(<>

						<tr style={{backgroundColor:"white"}} key={this.row_keys[i]}>
							<td key={this.props.index+"_"+i+"_"+((i===(taula.calculs.length-1))?"last":"not_last")} className="pt-1 ps-1 pe-0 align-middle" style={{wordWrap:"break-word", borderBottomLeftRadius:((i===(taula.calculs.length-1))?"0.75rem":"0")}}>

								<div className="d-flex justify-content-between">

								<Button
									className="me-1 mb-1 py-0 px-1 btn-danger"
									size="sm"
									onClick={()=>{
										//if (window.confirm("Eliminar part \""+(row.nom)+"\"?"))
										this.eliminaFila(i);
									}}
								>
									<b className="py-0">
										<span style={{fontFamily: "monospace", fontSize: "1rem"}}>✖</span>
									</b>
								</Button>


								<ButtonGroup >
									{//i>0 ?
										<Button
											className="py-0 px-1 btn-light up_down"
											size="sm"
											disabled={!(i>0)}
											onClick={()=>{
												if (i>0){
													this.moveRowFromIndexToIndex(i, i-1);
													this.forceUpdate();
												}
											}}
										>
											<b className="py-0">
												<span style={{fontFamily: "monospace", fontSize: "1rem"}}>▲</span>
											</b>
										</Button>
									//:""
									}
									

									
									{//i<taula.calculs.length-1 ?
										<Button
											className="py-0 px-1 btn-light up_down"
											size="sm"
											disabled={!(i<taula.calculs.length-1)}
											onClick={()=>{
												if (i<taula.calculs.length-1){
													this.moveRowFromIndexToIndex(i, i+1);
													this.forceUpdate();
												}
											}}
										>
											<b className="py-0">
												<span style={{fontFamily: "monospace", fontSize: "1rem"}}>▼</span>
											</b>
										</Button>
									//:""
									}
								</ButtonGroup >

								</div>






								<MagicInput ref={this.row_noms_refs[i]} /*key={row.nom}*/ original_value={row.nom} max={48} updateFunc={(v)=>{row.nom = v; this.forceUpdate()}} showEditable={false} colwidth_ref={this.colwidth_refs[0]} />{this.name_selector(i)}
							</td>


							<td className="text-center align-middle px-0">
								<b>
								<MagicInput original_value={row.percentatge} type={"number"} updateFunc={(v)=>{row.percentatge = v; this.forceUpdate()}} extra_str="%" colwidth_ref={this.colwidth_refs[1]}  />
								</b>
							</td>


							{taula.smartTmanualF ? 
								<td className="text-center align-middle px-0">
									{row.objectiuTassolitF ? 
										<MagicInput original_value={row.confianca} type={"number"} updateFunc={(v)=>{row.confianca = v; this.forceUpdate()}} extra_str="%" colwidth_ref={this.colwidth_refs[2]}  />
									:
										<>{"100%"}</>
									}
								</td>
							:""}



							<td className="text-end align-middle px-0">
								<span className="magic_input_read align-middle" onClick={()=>{row.objectiuTassolitF=!row.objectiuTassolitF; this.forceUpdate()}} style={{cursor:"pointer"}}>
									<h6 className="d-inline">{row.objectiuTassolitF ? "☐":"☑"}</h6>
									&nbsp;
									<span className="mt-0 mb-1">
										{row.objectiuTassolitF ? "Vull un" : "Tinc un"}
									</span>
								</span>
							</td>


							<td className="align-middle px-0" style={{whiteSpace:"nowrap"}}>
								<b>
								{
									( (row.nota).toString().split(".")[0].length==1 ) ? <>&nbsp;</> : ""
								}
								{(row.objectiuTassolitF && taula.smartTmanualF) ? 
									<span className="result_read">&nbsp;{row.nota.toString().replace(".",",")}&nbsp;</span>
								:
									<MagicInput original_value={row.nota} type={"number"} updateFunc={(v)=>{row.nota = v; this.forceUpdate()}} max={this.notaMax} colwidth_ref={this.colwidth_refs[4]}  />
								}
								</b>
							</td>

						</tr>
						
						

					</>);})}







					<tr style={{borderBottomStyle:"hidden"}}>
						<td className="pt-0 px-0 text-center" colSpan={taula.smartTmanualF ? "3":"2"}>
						{taula.calculs.length < this.maxRows ? <>
								<Button
									className="py-0"
									style={{borderTopLeftRadius:"0", borderTopRightRadius:"0", width:"85%"}}
									onClick={()=>{
										this.addRowAndUpdate(
											{
												nom: "???",
												percentatge: (percentatge_total < 100) ? parseFloat((100-percentatge_total).toFixed(2)) : 0,
												nota: 5,
												confianca: 100,
												objectiuTassolitF: true
											}
										);
										//this.row_noms_refs[taula.calculs.length-2].current.forceUpdate();
									}}
								>
									<b>
										<span style={{fontFamily: "monospace", fontSize: "1rem"}}>+</span>
										&nbsp;
										<span className="small" >{"Nova part"}</span>
									</b>
								</Button>
										{this.name_selector(-1)}

								<br/>
							</>:""}

							<span
								style={{color:"red"}}
							>{(percentatge_total == 100) ? "" : <>
								{"Els percentatges no sumen 100% ("+(percentatge_total.toString().replace(".",","))+"%)."}
								</>}</span>
						</td>


						

						<td className="text-end align-middle" style={{backgroundColor:"white", borderBottomLeftRadius:"0.75rem"}}>
							<b>{"Nota final:"}</b>
						</td>


						<td className="align-middle mx-0 px-0" style={{whiteSpace:"nowrap", backgroundColor:"white", borderBottomRightRadius:"0.75rem"}}>
							<h6 className="mb-0">
							<b>

								{(!taula.smartTmanualF) ? 
									<span className="result_read">&nbsp;{nota_final.replace(".",",")
										//((nota_final.toFixed(2)%1 != 0) ? nota_final.toFixed(2) : nota_final.toFixed(0)).toString().replace(".",",")
										}&nbsp;</span>
								:
									<MagicInput 
										original_value={nota_final} 
										type={"number"} 
										updateFunc={(v)=>{
											taula.notaFinal = v;
											this.forceUpdate()
										}} 
										max={this.notaMax} 
										colwidth_ref={this.colwidth_refs[4]} 
									/>
								}


								
							</b>
							</h6>
						</td>

					</tr>











				


				</tbody>
			</Table>

				<br/><br/><br/>

		</>);
	}


}
















class InitialScreen extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
		};

		this.maxTaules = 50;

		
		this.taules = [];
		this.taules_ref = [];


		this.subjectList = [];
		this.partList = [
			["Teoria", true, 50],
			["Examen Parcial X", false, 20],
			["Examen Final", false, 30],
			["Pràctica", true, 50],
			["Pràctica X", false, 10],
			["Exercicis", true, 20],
			["Exercici X", false, 10],
			["Actitud", true, 10],
			["Assistència", true, 10],
			["Participació", true, 10],
		]
	}



	componentDidMount(){
		let local_saved_taules = JSON.parse(window.localStorage.getItem(
			"grade_calc"+"___"+Cookie.get("username")//Cookie.get("jwt")
			));
		//console.log(local_saved_taules);
		this.taules = local_saved_taules ? [...local_saved_taules.taules] : [];
		//console.log(this.taules[0]);



		this.taules_ref = [];
		for (let i=0; i<this.taules.length; i++){
			this.taules_ref.push(React.createRef());
		}
		//console.log(this.taules_ref);

		this.forceUpdate();
	}


	saveChanges(){
		//console.log(JSON.stringify(this.taules));
		window.localStorage.setItem(
			"grade_calc"+"___"+Cookie.get("username")//Cookie.get("jwt")
			,
			JSON.stringify({taules:this.taules})
		)
	}

	eliminaTotesLesTaules(){
		for (let i=this.taules_ref.length-1; i>=0; i--){
			this.taules_ref[i].current.eliminaTaula(false);
		}
	}

	updateSubjectList(data){
		this.subjectList = data;
		this.forceUpdate();
	}

	
	render(){


		let btn_delete_all = ((this.taules.length==0) ? "" : 
			<div className="text-center m-auto" style={{position:"sticky", top:"3.5rem", zIndex: "9999", width:"fit-content"}}>
				<Button
					className="py-0 btn-danger"
					onClick={()=>{
						if (window.confirm(
							"Segur que vols eliminar totes les taules actuals?"
						))
							this.eliminaTotesLesTaules();
					}}
				>
					<b>
					<span style={{fontFamily: "monospace", fontSize: "1rem"}}>✖</span>
					&nbsp;
					{"Elimina-ho tot"}
					</b>
				</Button>
				<br/><br/><br/>

			</div>
		);
	

		
		return(
			<>
				<NavBar currentSection={this.props.currentSection} />
				<br/><br/><br/><br/>

				<div className="grade_calc mx-auto" >
				
					<h2 className="text-center mb-4">Calculadora de notes:</h2>



					{btn_delete_all}



					{this.taules.map((taula, i) => {
						// saveChanges={()=>{this.saveChanges();}}
						return(<>
							<TaulaCalcul main_ref={this.props.main_ref} index={i} ref={this.taules_ref[i]} />
							<br/>
						</>);
					})}




					{this.taules.length < this.maxTaules ? 
						<p className="text-center">
							<Button
								className="py-0"
								onClick={()=>{
									this.taules.push({
										nom: "Assignatura",
										smartTmanualF: (this.taules.length>0) ? this.taules[this.taules.length-1].smartTmanualF : true,
										notaFinal: (this.taules.length>0) ? this.taules[this.taules.length-1].notaFinal : 5,
										calculs: [
											{
												nom: "Teoria",
												percentatge: 40,
												confianca: 100,
												nota: 7,
												objectiuTassolitF: false
											},
											{
												nom: "Pràctica",
												percentatge: 60,
												confianca: 100,
												nota: 9,
												objectiuTassolitF: true
											}
										]
									});
									this.taules_ref.push(React.createRef());
									this.saveChanges();
									this.forceUpdate();
								}}
							>
								<b>
									<span style={{fontFamily: "monospace", fontSize: "1.5rem"}}>+</span>
									&nbsp;
									{"Nova taula"}
								</b>
							</Button>
							<br/><br/>

						</p>
					:""}
					


				</div>
				<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
				<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
				<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
			</>
		);

	};
}



function GradeCalc(props){
	//ESTE TROZO DE CÓDIGO EXPULSA AL USUARIO SI INTENTA CARGAR UNA PÁGINA SIN ESTAR LOGUEADO
	/*if (!Cookie.get("jwt")){
		window.location.href = 
			window.location.protocol+"//"+window.location.host+
			(BaseName==="/"?"":BaseName) + "/signin";
	}*/
	user_validity_check_per_route();


	document.title = "ViGtory! Calculadora de notes";


	let navigate = useNavigate();
	function navigateTo(page) {
		navigate(page);
	}
	useEffect(() => {
		getSubjectList().then((data) => {
			//console.log(data);
			if (main_ref.current)
			main_ref.current.updateSubjectList(data);
		});
	  }, [window.location.href && new Date()]);

	let main_ref = React.createRef();

	return(
		<InitialScreen currentSection={props.currentSection} key={"grade_calc_"+(new Date().toString())} ref={main_ref} main_ref={main_ref} />
	)
}
export default GradeCalc;