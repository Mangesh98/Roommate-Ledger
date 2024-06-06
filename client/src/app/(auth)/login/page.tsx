// Login.tsx
"use client";
import authImage from "../../../../public/authImage.avif";
import React, { useState } from "react";
import { Form, Input, Checkbox, Button } from "antd";
import Image from "next/image";
import "@/app/styles/login.css";
import { useRouter } from "next/navigation";

interface LoginFormValues {
	email: string;
	password: string;
	remember: boolean;
}

const Login: React.FC = () => {
	const router = useRouter();
	const [loggingIn, setLoggingIn] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onFinish = async (values: LoginFormValues) => {
		setLoggingIn(true);
		setError(null);

		try {
			const url = `${process.env.NEXT_PUBLIC_DB_HOST}/login`;
			const response = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(values),
			});

			if (response.ok) {
				console.log("Login successful!");
				router.push("/");
			} else {
				const errorData = await response.json();
				setError(errorData.message || "Login failed");
			}
		} catch (error) {
			console.error("Error during login:", error);
			setError("An error occurred. Please try again later.");
		} finally {
			setLoggingIn(false);
		}
	};

	const onFinishFailed = (errorInfo: any) => {
		console.log("Failed:", errorInfo);
	};

	return (
		<div className="login-page">
			<div className="login-box">
				<div className="illustration-wrapper">
					<Image
						src={authImage}
						width={500}
						height={500}
						alt="Picture of the login page"
					/>
				</div>
				<Form
					name="login-form"
					initialValues={{ remember: true }}
					onFinish={onFinish}
					onFinishFailed={onFinishFailed}
				>
					<p className="form-title">Welcome back</p>
					<p>Login to the Dashboard</p>
					<Form.Item
						name="email"
						rules={[{ required: true, message: "Please input your Email!" }]}
					>
						<Input placeholder="Username" />
					</Form.Item>
					<Form.Item
						name="password"
						rules={[{ required: true, message: "Please input your password!" }]}
					>
						<Input.Password placeholder="Password" />
					</Form.Item>
					<Form.Item name="remember" valuePropName="checked">
						<Checkbox>Remember me</Checkbox>
					</Form.Item>
					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							className="login-form-button"
							disabled={loggingIn}
						>
							{loggingIn ? "Logging in..." : "LOGIN"}
						</Button>
					</Form.Item>
				</Form>
			</div>
		</div>
	);
};

export default Login;
