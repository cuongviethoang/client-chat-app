import { useContext } from "react";
import { Alert, Button, Form, Row, Col, Stack } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
const Login = () => {
    const {
        loginInfo,
        updateLoginInfo,
        loginUser,
        loginError,
        isLoginLoading,
    } = useContext(AuthContext);
    return (
        <>
            <Form onSubmit={loginUser}>
                <Row
                    style={{
                        height: "100vh",
                        justifyContent: "center",
                        paddingTop: "10%",
                    }}
                >
                    <Col xs={6}>
                        <Stack gap={3}>
                            <h2>Login</h2>
                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Email"
                                    onChange={(e) =>
                                        updateLoginInfo({
                                            ...loginInfo,
                                            email: e.target.value.trim(),
                                        })
                                    }
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Password"
                                    onChange={(e) =>
                                        updateLoginInfo({
                                            ...loginInfo,
                                            password: e.target.value.trim(),
                                        })
                                    }
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit">
                                {isLoginLoading ? "Search your count" : "Login"}
                            </Button>
                            {loginError?.error && (
                                <Alert variant="danger">
                                    <p>{loginError?.message}</p>
                                </Alert>
                            )}
                        </Stack>
                    </Col>
                </Row>
            </Form>
        </>
    );
};

export default Login;
