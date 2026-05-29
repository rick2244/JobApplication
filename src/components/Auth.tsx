import type {JSX} from 'react';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';


export default function Auth(): JSX.Element {
    const [showSignIn, setShowSignIn] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const isValidPassword = (password: string): boolean =>{
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isLongEnough = password.length >= 8;
        const matches = password === confirmPassword;
        return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough && matches;
    }

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        
        if (showSignIn) {
            if(!isValidPassword(password)){
                alert('Password must match, be at least 8 characters long and include uppercase, lowercase, number, and special character.');
                return;
            }
            try {
                const res = await fetch('http://localhost:3000/addUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password, confirmPassword })
                });
                if (res.ok) {
                    navigate('/');
                } else {
                    const errText = await res.text();
                    console.log(errText);
                    alert(`Sign up failed: ${res.status} ${errText}`);
                }
            } catch (err) {
                console.error(err);
                alert('Network error during sign up');
            }
        } else {
            try{
                const res = await fetch('http://localhost:3000/signIn', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                if(res.ok){
                    navigate('/home');
                }else{
                    const errText = await res.text();
                    console.log(errText);
                    alert(`Log in failed: ${res.status} ${errText}`);
                }

            }catch(err){
                console.error(err);
                alert('Network error during log in');

            }
            
        }
    };

    return (
        
        <div className='auth-container'>
        <button className="auth-btn" onClick={() => setShowSignIn(!showSignIn)}>{!showSignIn ? 'Create your account' : 'Sign in to your account'}</button>
        <form onSubmit={handleSubmit}>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" />
            <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
            {showSignIn && <input className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm Password" />}
            <button className="auth-btn" type="submit">{showSignIn ? 'Create Account' : 'Login'}</button>
        </form>
        </div>
        
    )
}