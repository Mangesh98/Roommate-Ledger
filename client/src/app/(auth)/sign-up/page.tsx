"use client";
import React, { useState } from "react";
import { Form, Input, Button } from "antd";
import "@/app/styles/login.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signUpAction } from "@/app/lib/usersAction";
import Link from "next/link";

export interface SignUpFormValues {
	name: string;
	email: string;
	password: string;
	room: string;
}

const Register: React.FC = () => {
	const router = useRouter();
	const [registering, setRegistering] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onFinish = async (values: SignUpFormValues) => {
		setRegistering(true);
		setError(null);

		try {
			const result = await signUpAction(values);

			if (result.error) {
				setError(result.error);
			} else {
				console.log("Registration successful!");
				router.push("/");
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
						src="/authImage.avif"
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
					<p className="form-title">Welcome !</p>
					{/* <p>Login to the Dashboard</p> */}
					<p>Register to the Roommate Ledger</p>
					<Form.Item
						name="name"
						rules={[{ required: true, message: "Please input your Name!" }]}
					>
						<Input placeholder="Name" />
					</Form.Item>
					<Form.Item
						name="room"
						rules={[
							{ required: true, message: "Please input your Room Name!" },
						]}
					>
						<Input placeholder="Homies" />
					</Form.Item>
					<Form.Item
						name="email"
						rules={[{ required: true, message: "Please input your Email!" }]}
					>
						<Input placeholder="Email" />
					</Form.Item>

					<Form.Item
						name="password"
						rules={[{ required: true, message: "Please input your password!" }]}
					>
						<Input.Password placeholder="Password" />
					</Form.Item>

					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							className="login-form-button"
							disabled={registering}
						>
							{registering ? "Logging in..." : "LOGIN"}
						</Button>
					</Form.Item>
					<Form.Item>
						<Link href="/sign-in" type="primary" className="login-form-button">
							Sign In
						</Link>
					</Form.Item>
				</Form>
			</div>
		</div>
	);
};

export default Register;
