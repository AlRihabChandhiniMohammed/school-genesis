import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api.js';
import { Users, Search, Trash2, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetch = () => {
    setLoading(true);
    adminAPI.users({ role: roleFilter, page }).then(r => { setUsers(r.data.users); setTotal(r.data.total); }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, [roleFilter, page]);

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      setDeleteConfirm(null);
      fetch();
    } catch { toast.error('Delete failed'); }
  };

  const roleColors = { teacher: 'bg-primary/10 text-primary', student: 'bg-secondary/10 text-secondary', admin: 'bg-green-500/10 text-green-600' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-3"><Users className="w-7 h-7 text-primary" />Manage Users</h1>
          <p className="text-text-secondary text-sm">{total} total users</p></div>
      </div>

      <div className="flex gap-3">
        {['all', 'teacher', 'student', 'admin'].map(r => (
          <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${roleFilter === r ? 'bg-primary text-white' : 'bg-white dark:bg-bg-dark border border-border dark:border-white/10 text-text-secondary hover:border-primary/50'}`}>
            {r === 'all' ? 'All' : r + 's'}
          </button>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
        {loading ? <div className="py-12 text-center text-text-secondary">Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border dark:border-white/10">
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Email</th>
                <th className="text-left py-3 px-4 font-medium">Role</th>
                <th className="text-left py-3 px-4 font-medium">Joined</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b border-border/50 dark:border-white/5">
                    <td className="py-3 px-4 font-medium">{u.name}</td>
                    <td className="py-3 px-4 text-text-secondary">{u.email}</td>
                    <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[u.role]}`}>{u.role}</span></td>
                    <td className="py-3 px-4 text-text-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => setDeleteConfirm(u)} className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-text-secondary">No users found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border dark:border-white/10">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-xl text-sm border border-border dark:border-white/10 disabled:opacity-30 hover:bg-surface-hover">Previous</button>
          <span className="text-sm text-text-secondary">Page {page}</span>
          <button disabled={users.length < 50} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-xl text-sm border border-border dark:border-white/10 disabled:opacity-30 hover:bg-surface-hover">Next</button>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white dark:bg-bg-dark rounded-2xl p-6 max-w-sm w-full border border-border dark:border-white/10 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-red-500"><AlertTriangle className="w-6 h-6" /><h3 className="font-semibold">Confirm Delete</h3></div>
            <p className="text-sm text-text-secondary">Delete <strong>{deleteConfirm.name}</strong> ({deleteConfirm.email})? This will also remove their classes/attempts.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-xl border border-border dark:border-white/10 text-sm">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm._id)} className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
