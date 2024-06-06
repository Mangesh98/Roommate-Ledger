// Register.tsx
"use client";
import React, { useState } from "react";
import { Form, Input, Button } from "antd";
import authImage from "../../../../public/authImage.avif";
import "@/app/styles/login.css";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SignUpFormValues {
	name: string;
	email: string;
	password: string;
}

const Register: React.FC = () => {
	const router = useRouter();
	const [registering, setRegistering] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onFinish = async (values: SignUpFormValues) => {
		setRegistering(true);
		setError(null);

		try {
			const url = `${process.env.NEXT_PUBLIC_DB_HOST}/register`;
		
			const response = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(values),
			});

			if (response.ok) {
				console.log("Registration successful!");
				// Handle successful registration (e.g., redirect to login page)
				router.push("/login");
			} else {
				const errorData = await response.json();
				setError(errorData.message || "Registration failed");
			}
		} catch (error) {
			console.error("Error during registration:", error);
			setError("An error occurred. Please try again later.");
		} finally {
			setRegistering(false);
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
					name="register-form"
					onFinish={onFinish}
					onFinishFailed={onFinishFailed}
				>
					<p className="form-title">Welcome!</p>
					<p>Register to the Roommate Ledger</p>
					<Form.Item
						name="name"
						rules={[{ required: true, message: "Please input your name!" }]}
					>
						<Input placeholder="Name" />
					</Form.Item>
					<Form.Item
						name="email"
						rules={[{ required: true, message: "Please input your email!" }]}
					>
						<Input placeholder="Email" />
					</Form.Item>
					<Form.Item
						name="password"
						rules={[{ required: true, message: "Please input your password!" }]}
					>
						<Input.Password placeholder="Password" />
					</Form.Item>
					{error && <p className="error-message">{error}</p>}
					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							className="login-form-button"
							disabled={registering}
						>
							{registering ? "Registering..." : "Sign Up"}
						</Button>
					</Form.Item>
				</Form>
			</div>
		</div>
	);
};

export default Register;
