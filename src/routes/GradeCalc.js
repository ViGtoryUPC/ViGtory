import React from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import {API_address} from '../libraries/API_address';
//import ReactDOM from 'react-dom';
import { Routes, Route, Link, useHistory, useNavigate } from "react-router-dom";

import { Accordion, Button, Form, FloatingLabel, Table } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';

import NavBar from "../components/NavBar";

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/GradeCalc.css';

import { Cookie } from '../libraries/cookie';
import {BaseName} from "../libraries/basename";

//IMPORTANTE PARA QUE NO SE VEA MAL AL ABRIR EL TECLADO EN MÓVIL
//https://stackoverflow.com/questions/32963400/android-keyboard-shrinking-the-viewport-and-elements-using-unit-vh-in-css
var viewport = document.querySelector("meta[name=viewport]");
viewport.setAttribute("content", viewport.content + ", height=" + window.innerHeight);









class MagicInput extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
		};

		this.inherited_height = 0;
		//this.inherited_width = 0;

		this.readTeditF = true;
		this.read_ref = React.createRef();
		this.edit_ref = React.createRef();
		this.type = this.props.type ? this.props.type : "text"; //o "number"
		this.extra_str = this.props.extra_str ? this.props.extra_str : ""; //%

		this.min = this.props.min ? this.props.min : 0;
		this.max = this.props.max ? this.props.max : 100;
		this.step = this.props.step ? this.props.step : 0.01;

		this.value = this.props.original_value ? this.props.original_value : "";
		this.updateFunc = this.props.updateFunc ? this.props.updateFunc : (v)=>{};

		this.showEditable = true;
		this.editableIndicator = <span className="small" style={{fontSize:"0.60rem", position:"relative", bottom:"0.1rem"}}>✏️</span>;
	}





	focus(){
		if (this.edit_ref.current){
			this.edit_ref.current.focus();
		}
	}


	changeToEditMode(){
		setTimeout(()=>{
			this.readTeditF = false;
			this.forceUpdate();
		},50);

		setTimeout(()=>{
			this.focus();
		},100);
	}
	changeToReadMode(){
		this.readTeditF = true;
		this.forceUpdate();
	}

	render(){
		//this.inherited_height = 0;
		//console.log(this.value);

		if (this.read_ref.current) this.inherited_height = (this.read_ref.current.offsetHeight > 0) ? this.read_ref.current.offsetHeight : this.inherited_height;

		//else if (this.edit_ref.current) this.inherited_height = (this.edit_ref.current.offsetHeight > 0) ? this.edit_ref.current.offsetHeight : this.inherited_height;

		//if (this.read_ref.current) this.inherited_width = (this.read_ref.current.offsetWidth > 0) ? this.read_ref.current.offsetWidth : this.inherited_width;


		let width = ( 
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
		);
		//if (!this.readTeditF) console.log("Width:        "+width);
		//if (!this.readTeditF) console.log("Parent width: "+this.inherited_width);


		return(<>

			{this.readTeditF ? <>


				<span
					ref={this.read_ref}
					className="magic_input_read"
					onClick={()=>{
						this.changeToEditMode();
					}}
				>
					{(this.type == "number") ? this.value.toString().replace(".",",") : this.value}
					{this.extra_str}
					{this.showEditable?this.editableIndicator:""}
				</span>


			</>:<>


				<Form.Control
					autoFocus
					size="sm"
					className="mb-0 p-0 ps-1 d-inline"
					style={{
						textAlign:"inherit",

						//minWidth:"0",
						//width:"75%",
						minWidth:(Math.max(width, "25")).toString()+"px",
						//maxWidth:this.inherited_width.toString()+"px",
						width:width.toString()+"px",
						//width:Math.min(width, this.inherited_width).toString()+"px",
						//maxWidth:"10px",

						minHeight:"0",
						height:"inherit",

						backgroundColor:"rgba(255,255,255,0)",
						border:"none",
						paddingTop:"-2rem",
						color: "inherit",
						fontSize: "inherit",
						fontWeight: "inherit"
					}}
					ref={this.focusRef}

					type={this.type}

					min={this.min}
					max={this.max}
					step={this.step}

					maxLength={this.max}

					defaultValue={this.value}

					onKeyUp={(e)=>{
						if (e.key === 'Enter' || e.keyCode === 13){
							this.changeToReadMode();
						}
					}}
					onChange={(e)=>{
						if (this.type == "number"){
							e.currentTarget.value = Math.max(this.min, e.currentTarget.value);
							e.currentTarget.value = Math.min(this.max, e.currentTarget.value);
						}
						if (this.type == "text"){
							e.currentTarget.value = e.currentTarget.value.slice(0, this.max);
						}
						this.value = e.currentTarget.value;
						this.updateFunc(this.value);
						//this.forceUpdate();
					}}
					onBlur={()=>{
						this.changeToReadMode();
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

	}



	eliminaTaula(){
		this.props.main_ref.current.taules.splice(this.props.index, 1);
		this.props.main_ref.current.taules_ref.splice(this.props.index, 1);
		this.props.main_ref.current.forceUpdate();
	}




	changeAttr(json, attr, val){
		let j = {...json};
		j[attr] = val;
		return j;
	}

	render(){
		let taula = this.props.main_ref.current.taules[this.props.index];
		let header_style = {backgroundColor:"#3488bb", color:"white", width:"auto", /*border:"1px solid #30577b",*/ width:"75%"};

		let nota_final = taula.smartTmanualF ? taula.notaFinal : taula.calculs.reduce((sum, val)=>{return sum+(val.nota*val.percentatge/100)}, 0);



		if (taula.smartTmanualF){

			let assolit = taula.calculs.reduce(
				(sum, row)=>
					sum + (row.objectiuTassolitF ? 0 : row.nota*(row.percentatge/100))
			, 0).toFixed(2);
			//console.log(taula.calculs);
			console.log(assolit);

			let percentatge_no_assolit = taula.calculs.reduce(
				(sum, row)=>
					sum + (row.objectiuTassolitF ? row.percentatge : 0)
			, 0).toFixed(2);

			taula.calculs.map((row, i) => {
				if (row.objectiuTassolitF){
					if(assolit >= taula.notaFinal) row.nota = 0;

					row.nota = (taula.notaFinal-assolit)*(row.percentatge/percentatge_no_assolit)/(row.percentatge/100)*(1+(1-row.confianca/100));

					row.nota = row.nota.toFixed(2);
				}
			})
		}


		return(<>
			<div className="d-flex justify-content-between">
				<h5 className="mb-0 px-2 pt-1 pb-1" style={taula.nom.length>0 ? {backgroundColor:"rgba(11,94,215,1)", color:"white", borderTopLeftRadius:"0.5rem", borderTopRightRadius:"0.5rem"} : {}}>
					<Button
						className="me-1 py-0 px-1 btn-danger"
						size="sm"
						onClick={()=>{
							this.eliminaTaula();
						}}
					>
						<b className="py-0">
							<span style={{fontFamily: "monospace", fontSize: "1rem"}}>✖</span>
						</b>
					</Button>


					<b>
						<MagicInput original_value={taula.nom} max={24} updateFunc={(v)=>{taula.nom = v; this.forceUpdate()}} />
					</b>
				</h5>


				<Button
					className="py-0 px-1 me-3 mb-1 small"
					size="sm"
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
			


			<Table className="mb-0" style={{tableLayout:"fixed", width:"100%", borderCollapse:"collapse", borderStyle:"none !important", borderBottomLeftRadius:"0.75rem", borderTopRightRadius:"0.75rem !important", overflow:"hidden"}}>

				<thead>
					<tr>
						<th style={this.changeAttr(header_style, "width", taula.smartTmanualF ?"30%":"50%")}>
							{"Part"}
						</th>


						<th style={this.changeAttr(header_style, "width", "20%")}>
							{"Percent"}
						</th>

						{taula.smartTmanualF ? 
							<th style={this.changeAttr(header_style, "width", "20%")}>
								{"Confiança"}
							</th>
						:""}
						

						<th style={this.changeAttr(header_style, "width", "15%")}>
							{"Objectiu"}
						</th>


						<th style={this.changeAttr(
									this.changeAttr(header_style, "width", "15%")
									,"borderTopRightRadius", "0.75rem"
									)}>
							{"Nota"}
						</th>

					</tr>
				</thead>


				<tbody>
					{taula.calculs.map((row, i) => {return(<>

						<tr style={{backgroundColor:"white"}}>
							<td className="ps-1 align-middle" style={{wordWrap:"break-word", borderBottomLeftRadius:((i==(taula.calculs.length-1))?"0.75rem":"0")}}>
								<Button
									className="me-1 py-0 px-1 btn-danger"
									size="sm"
									onClick={()=>{
										taula.calculs.splice(i, 1);
										if (taula.calculs.length == 0) this.eliminaTaula();
										else this.forceUpdate();
									}}
								>
									<b className="py-0">
										<span style={{fontFamily: "monospace", fontSize: "1rem"}}>✖</span>
									</b>
								</Button>



								<MagicInput original_value={row.nom} max={32} updateFunc={(v)=>{row.nom = v; this.forceUpdate()}} />
							</td>


							<td className="text-center align-middle">
								<b>
								<MagicInput original_value={row.percentatge} type={"number"} updateFunc={(v)=>{row.percentatge = v; this.forceUpdate()}} extra_str="%" />
								</b>
							</td>


							{taula.smartTmanualF ? 
								<td className="text-center align-middle">
									{row.objectiuTassolitF ? 
										<MagicInput original_value={row.confianca} type={"number"} updateFunc={(v)=>{row.confianca = v; this.forceUpdate()}} extra_str="%" />
									:
										<>{"100%"}</>
									}
								</td>
							:""}



							<td className="text-end align-middle">
								<span className="magic_input_read" onClick={()=>{row.objectiuTassolitF=!row.objectiuTassolitF; this.forceUpdate()}} style={{cursor:"pointer"}}>
									{row.objectiuTassolitF ? "Vull un" : "Tinc un"}
								</span>
							</td>


							<td className="align-middle" style={{whiteSpace:"nowrap"}}>
								<b>
								{
									( (row.nota).toString().split(".")[0].length==1 ) ? <>&nbsp;</> : ""
								}
								{(row.objectiuTassolitF && taula.smartTmanualF) ? 
									<>&nbsp;{row.nota}</>
								:
									<MagicInput original_value={row.nota} type={"number"} updateFunc={(v)=>{row.nota = v; this.forceUpdate()}} max={10} />
								}
								</b>
							</td>

						</tr>
						
						

					</>);})}







					<tr style={{borderBottomStyle:"hidden"}}>
						<td className="pt-0 text-center" colSpan={taula.smartTmanualF ? "3":"2"}>
							<Button
								className="py-0"
								style={{borderTopLeftRadius:"0", borderTopRightRadius:"0", width:"85%"}}
								onClick={()=>{
									taula.calculs.push(
										{
											nom: "???",
											percentatge: 50,
											nota: 5,
											confianca: 100,
											objectiuTassolitF: true
										}
									);
									this.forceUpdate();
								}}
							>
								<b>
									<span style={{fontFamily: "monospace", fontSize: "1rem"}}>+</span>
									&nbsp;
									<span className="small" >{"Nova part"}</span>
								</b>
							</Button>
						</td>


						

						<td className="text-end align-middle" style={{backgroundColor:"white", borderBottomLeftRadius:"0.75rem"}}>
							<b>{"Nota final:"}</b>
						</td>


						<td className="align-middle" style={{whiteSpace:"nowrap", backgroundColor:"white", borderBottomRightRadius:"0.75rem"}}>
							<h6 className="mb-0">
							<b>

								{(!taula.smartTmanualF) ? 
									<>{nota_final.toFixed(2).toString().replace(".",",")}</>
								:
									<MagicInput 
										original_value={nota_final} 
										type={"number"} 
										updateFunc={(v)=>{
											taula.notaFinal = v;
											this.forceUpdate()
										}} 
										max={10} 
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


		this.taules = [];
		this.taules_ref = [];

	}

	
	render(){
		
		return(
			<>
				<NavBar currentSection={this.props.currentSection} />
				<br/><br/><br/><br/>

				<div className="schedule_gen mx-auto" >
				
					<h2 className="text-center mb-4">Calculadora de notes:</h2>





					{this.taules.map((taula, i) => {
						return(<>
							<TaulaCalcul main_ref={this.props.main_ref} index={i} ref={this.taules_ref[i]} />
							<br/>
						</>);
					})}





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
	if (!Cookie.get("jwt")){
		window.location.href = 
			window.location.protocol+"//"+window.location.host+
			(BaseName==="/"?"":BaseName) + "/signin";
	}



	document.title = "ViGtory! Calculadora de notes";


	let navigate = useNavigate();
	function navigateTo(page) {
		navigate(page);
	}
	useEffect(() => {




	  }, []);

	let main_ref = React.createRef();

	return(
		<InitialScreen currentSection={props.currentSection} ref={main_ref} main_ref={main_ref} />
	)
}
export default GradeCalc;