import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import NewMapwindow from "../Mapwindow/NewMapwindow";
import Main from "../Main/Main";
import Grid from "@mui/material/Grid";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import logoWhite from "../Styles/source/logo_w.png";
import ShareIcon from "@material-ui/icons/Share";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import { MenuItem } from "@mui/material";
import Button from "@mui/material/Button";

import styled from "styled-components";

const ImgWrapper = styled.img`
	display: block;
	width: 10%;
`;

const TextWrapper = styled.span`
	display: flex;
	justify-content: center; /* align horizontal */
	align-items: center; /* align vertical */
`;

function Map() {
	const location = useLocation();
	//'keep' button open > submenu
	const [anchorEl, setAnchorEl] = React.useState(null);
	const open = Boolean(anchorEl);

	const { groupID, userName } = location.state;

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	return (
		<>
			<AppBar postiion="static" style={{ backgroundColor: "#151ca2" }}>
				<Typography
					variant="h5"
					noWrap
					component="div"
					sx={{ mr: 2, display: { xs: "none", md: "flex" } }}
				>
					<ImgWrapper src={logoWhite}></ImgWrapper>
					<IconButton style={{ color: "white" }}>
						<ShareIcon></ShareIcon>
					</IconButton>
					<Box sx={{ flexGrow: 1 }}></Box>

					<Button
						id="basic-button"
						aria-controls={open ? "basic-menu" : undefined}
						aria-haspopup="true"
						aria-expanded={open ? "true" : undefined}
						onClick={handleClick}
						style={{ color: "white" }}
					>
						<TextWrapper>{groupID}&nbsp; 그룹 화면</TextWrapper>
					</Button>
					<Menu
						anchorEl={anchorEl}
						open={open}
						MenuListProps={{
							"aria-labelledby": "basic-button",
						}}
						onClose={handleClose}
					>
						<MenuItem>
							<Link
								to={`/${groupID}/search`}
								state={{
									groupID: groupID,
									userName: userName,
								}}
							>
								<TextWrapper>{groupID}&nbsp; 개인 화면</TextWrapper>
							</Link>
						</MenuItem>

						<MenuItem>
							<Link
								to={`/${groupID}/share`}
								state={{
									groupID: groupID,
									userName: userName,
								}}
							>
								<TextWrapper>{groupID}&nbsp; 공유 화면</TextWrapper>
							</Link>
						</MenuItem>
					</Menu>
				</Typography>
			</AppBar>
			<Grid container spacing={2} style={{ marginTop: 60, padding: 20 }}>
				<Grid item xs={6} md={8}>
					<NewMapwindow></NewMapwindow>
				</Grid>
				<Grid item xs={6} md={4}>
					<Main groupID={groupID} userName={userName} userLocation={""}></Main>
				</Grid>
			</Grid>
		</>
	);
}

export default Map;
