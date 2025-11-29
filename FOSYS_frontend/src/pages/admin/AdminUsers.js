import React, { useState, useEffect } from 'react'; // Import useEffect
import { Search, Plus } from 'lucide-react'; // Import Plus icon
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'; // Import Button
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { MOCK_USERS } from '@/utils/mockData'; // <-- DELETE THIS MOCK DATA IMPORT!
import { fetchAllUsers } from '../../services/userService'; // Import the new API function
import CreateUserModal from '../../components/admin/CreateUserModal'; // Adjust path
import { useToast, toast as staticToastFunction } from '../../hooks/use-toast.js';

const AdminUsers = ({ user }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]); // State for real user data
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { toast } = useToast();

    // Function to fetch data from the backend
    // Inside loadUsers function in AdminUsers.js
    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAllUsers();
            setUsers(data);
        } catch (error) {
            // This is the correct call on the destructured function
            toast({
                title: "Error loading users.", 
                description: "Check your network or server logs.",
                variant: "destructive" 
            });
            setUsers([]); 
        } finally {
            setIsLoading(false);
        }
    };  

    // Load users on component mount
    useEffect(() => {
        loadUsers();
    }, []); 

    // Filter using the real users state
    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getInitials = (name) => {
        // ... (existing implementation)
    };

    // Check if the current user has permission to add users
    const canAddUsers = user.role === 'ADMIN' || user.role === 'MANAGER'; 

    return (
        <div className="p-8" data-testid="admin-users-page">
            <div className="mb-8 flex justify-between items-center">
                <h1 className="text-4xl font-bold text-white mb-0" style={{fontFamily: 'Work Sans'}}>User Management</h1>
                
                {/* ADD USER BUTTON */}
                {canAddUsers && (
                    <Button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Add New User
                    </Button>
                )}
            </div>

            {/* SEARCH BAR */}
            <div className="relative max-w-md mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                />
            </div>

            {/* LOADING STATE */}
            {isLoading && <p className="text-slate-400">Loading users...</p>}

            {/* USER LIST TABLE */}
            {!isLoading && (
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
                    {/* ... (existing table structure) ... */}
                    {/* Change {filteredUsers.map((u) => ...} to use the real users state */}
                </div>
            )}
            
            {/* USER CREATION MODAL */}
            {isModalOpen && (
                <CreateUserModal 
                    onClose={() => setIsModalOpen(false)} 
                    onUserCreated={() => { 
                        loadUsers(); 
                        staticToastFunction({ 
                            title: "User created successfully!", 
                            variant: "success" 
                        }); 
                    }}
                />
            )}
        </div>
    );
};

export default AdminUsers;