import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route, Link, useParams } from "react-router-dom";
import { Button } from 'react-bootstrap';

import SignInUp from "./routes/SignInUp";
import ProfileSettings from "./routes/ProfileSettings";
import UserProfile from "./routes/UserProfile";
import Home from "./routes/Home";
import GradeCalc from "./routes/GradeCalc";
import ScheduleGen from "./routes/ScheduleGen";
//import NavBar from "./components/NavBar";






// ========================================

//<SignInUp loginTregisterF={false} />
ReactDOM.render(
	<BrowserRouter>
		<Routes>

			<Route path="/" element={<Home currentSection="/" />} />



			<Route path="signin" element={<SignInUp loginTregisterF={true} />} />

			<Route path="signup" element={<SignInUp loginTregisterF={false} />} />

			

			<Route path="settings" element={<ProfileSettings />} />

			<Route path="user/:id" element={<UserProfile />} />



			<Route path="grade_calc" element={<GradeCalc currentSection="/grade_calc" />} />

			<Route path="schedule_gen" element={<ScheduleGen currentSection="/schedule_gen" />} />







			<Route
				path="*"
				element={
					<main style={{ padding: "1rem" }}>
						<p className="text-center">
							<br/><br/>
							La pàgina a què intentes accedir està buida.
							<br/><br/><br/>
							Tornar a l'inici?
							<br/><br/>
							<Link to="/"><Button>Pàgina principal</Button></Link>
						</p>
					</main>
				}
			/>

		</Routes>
  	</BrowserRouter>,
	document.getElementById('root')
);
