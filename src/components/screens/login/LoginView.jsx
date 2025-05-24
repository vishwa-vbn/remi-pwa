// import React from "react";
// import { FcGoogle } from "react-icons/fc";
// import { Box, Button, Typography, Paper } from "@mui/material";
// import logo from "../../../../public/icon-192x192.png";

// const LoginView = ({ onGoogleSignIn }) => {
//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         px: 2,
//       }}
//     >
//       <Paper
//         elevation={6}
//         sx={{
//           width: "100%",
//           maxWidth: 400,
//           borderRadius: 2,
//           p: 2,
//           backgroundColor: "#ffffff",
//           boxShadow: "0 8px 24px rgba(0, 0, 0, 0.05)",
//           textAlign: "center",
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             backgroundColor: "#eef2f7",
//             px: 2,
//             py: 2,
//             gap: 1,
//             mb: 2,
//           }}
//         >
//           <Box
//             component="img"
//             src={logo}
//             alt="App Logo"
//             sx={{
//               width: 100,
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               height: 100,
//               mb: 0,
//               borderRadius: 2,
//             }}
//           />

//           <Typography
//             variant="body2"
//             sx={{
//               color: "#6b7280",
//               fontSize: "0.95rem",
//               textAlign: "center",
//             }}
//           >
//             Log in to organize your tasks and boost your efficiency.
//           </Typography>
//         </Box>

//         {/* Google Sign In Button */}
//         <Button
//           onClick={onGoogleSignIn}
//           fullWidth
//           variant="outlined"
//           startIcon={<FcGoogle />}
//           sx={{
//             textTransform: "none",
//             fontWeight: 500,
//             borderRadius: 2,
//             borderColor: "#d1d5db",
//             color: "#374151",
//             py: 1.25,
//             fontSize: "1rem",
//             "&:hover": {
//               backgroundColor: "#f3f4f6",
//               borderColor: "#cbd5e1",
//               boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
//             },
//           }}
//         >
//           Sign in with Google
//         </Button>

//         {/* Terms and Conditions Text */}
//         <Typography
//           variant="caption"
//           sx={{
//             mt: 2,
//             display: "block",
//             color: "#9ca3af",
//             fontSize: "0.75rem",
//           }}
//         >
//           By signing in, you agree to our Terms and Conditions.
//         </Typography>
//       </Paper>
//     </Box>
//   );
// };

// export default LoginView;


import React from "react";
import { FcGoogle } from "react-icons/fc";
import { Box, Button, Typography, Paper, CircularProgress, Snackbar, Alert } from "@mui/material";
import logo from "../../../../public/icon-192x192.png";

const LoginView = ({ onGoogleSignIn, isLoading, error }) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        backgroundColor: "#f4f6f8",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 400,
          borderRadius: 2,
          p: 3,
          backgroundColor: "#ffffff",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.05)",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#eef2f7",
            px: 2,
            py: 2,
            gap: 1,
            mb: 3,
            borderRadius: 2,
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="App Logo"
            sx={{
              width: 80,
              height: 80,
              borderRadius: 2,
            }}
          />
          <Typography
            variant="body2"
            sx={{
              color: "#6b7280",
              fontSize: "0.95rem",
              textAlign: "center",
            }}
          >
            Log in to organize your tasks and boost your efficiency.
          </Typography>
        </Box>

        <Button
          onClick={onGoogleSignIn}
          fullWidth
          variant="outlined"
          startIcon={isLoading ? <CircularProgress size={20} /> : <FcGoogle />}
          disabled={isLoading}
          sx={{
            textTransform: "none",
            fontWeight: 500,
            borderRadius: 2,
            borderColor: "#d1d5db",
            color: "#374151",
            py: 1.25,
            fontSize: "1rem",
            "&:hover": {
              backgroundColor: "#f3f4f6",
              borderColor: "#cbd5e1",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            },
            "&:disabled": {
              backgroundColor: "#f9fafb",
              color: "#9ca3af",
            },
          }}
        >
          {isLoading ? "Signing in..." : "Sign in with Google"}
        </Button>

        <Typography
          variant="caption"
          sx={{
            mt: 2,
            display: "block",
            color: "#9ca3af",
            fontSize: "0.75rem",
          }}
        >
          By signing in, you agree to our Terms and Conditions.
        </Typography>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default LoginView;