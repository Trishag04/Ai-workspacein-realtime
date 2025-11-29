import React, { useState } from 'react';
import { createUser } from '../../services/userService'; // Adjust path as needed
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Assume you have a Modal/Dialog component available, otherwise use a simple div
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CreateUserModal = ({ onClose, onUserCreated }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'EMPLOYEE'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (value) => {
        setFormData({ ...formData, role: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await createUser(formData);
            onUserCreated(); // Callback to refresh the user list
            onClose(); 
        } catch (err) {
            setError(err.error || 'Failed to create user.');
        } finally {
            setIsLoading(false);
        }
    };

    // Replace with your actual Dialog/Modal component structure
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-slate-900 p-8 rounded-xl shadow-2xl w-96">
                <h3 className="text-xl font-semibold text-white mb-4">Create New Employee</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input name="name" placeholder="Full Name" onChange={handleChange} required />
                    <Input name="email" type="email" placeholder="Email (e.g., jane@fosys.com)" onChange={handleChange} required />
                    <Input name="password" type="password" placeholder="Temporary Password" onChange={handleChange} required />
                    
                    <Select onValueChange={handleRoleChange} value={formData.role}>
                        <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="EMPLOYEE">Employee</SelectItem>
                            <SelectItem value="INTERN">Intern</SelectItem>
                        </SelectContent>
                    </Select>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUserModal;