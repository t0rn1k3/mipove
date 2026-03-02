"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Briefcase,
  Shield,
  TrendingUp,
  Search,
  UserCheck,
  UserX,
  Trash2,
  Plus,
  X,
  Mail,
  Phone,
  Activity,
  CheckCircle,
  ArrowUpCircle,
  Lock,
  Edit,
  MoreVertical,
} from "lucide-react";
import Navbar from "@/components/navbar/Navbar";
import styles from "./AdminDashboard.module.css";

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`${styles.tabButton} ${active ? styles.active : ""}`}
    >
      <Icon size={20} />
      {children}
    </button>
  );
}

function StatCard({ icon: Icon, title, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={styles.statCard}
    >
      <div className={`${styles.statIconWrapper} ${styles[color]}`}>
        <Icon size={28} className={styles.statIcon} />
      </div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{title}</div>
    </motion.div>
  );
}

function QuickActionButton({ icon: Icon, label, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={styles.quickActionBtn}
    >
      <div className={styles.quickActionIcon}>
        <Icon size={20} />
      </div>
      <span className={styles.quickActionLabel}>{label}</span>
    </motion.button>
  );
}

function ActivityItem({ icon: Icon, text, time }) {
  return (
    <div className={styles.activityItem}>
      <div className={styles.activityIcon}>
        <Icon size={20} />
      </div>
      <div>
        <p className={styles.activityText}>{text}</p>
        <p className={styles.activityTime}>{time}</p>
      </div>
    </div>
  );
}

function ActionMenu({ onClose, actions }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className={styles.actionMenu}
    >
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={index}
            onClick={action.onClick}
            className={`${styles.actionMenuItem} ${styles[action.color]}`}
          >
            <Icon size={18} />
            <span>{action.label}</span>
          </button>
        );
      })}
    </motion.div>
  );
}

function UserManagementTable({
  users,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  onBlockUser,
  onUpgradeToMaster,
  onDeleteUser,
  showActionMenu,
  setShowActionMenu,
}) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.filtersRow}>
        <div className={styles.filtersFlex}>
          <div className={styles.searchWrapper}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className={styles.searchInput}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.tableTh}>User</th>
              <th className={styles.tableTh}>Contact</th>
              <th className={styles.tableTh}>Status</th>
              <th className={styles.tableTh}>Join Date</th>
              <th className={styles.tableTh}>Last Active</th>
              <th className={styles.tableTh}>Actions</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {users.map((user) => (
              <tr key={user.id}>
                <td className={styles.tableTd}>
                  <div className={styles.userCell}>
                    <div className={styles.userAvatar}>{user.name.charAt(0)}</div>
                    <div>
                      <div className={styles.userName}>{user.name}</div>
                      <div className={styles.userId}>ID: {user.id}</div>
                    </div>
                  </div>
                </td>
                <td className={styles.tableTd}>
                  <div className={styles.contactRow}>
                    <Mail size={14} />
                    {user.email}
                  </div>
                  <div className={`${styles.contactRow} ${styles.contactRowSecondary}`}>
                    <Phone size={14} />
                    {user.phone}
                  </div>
                </td>
                <td className={styles.tableTd}>
                  <span className={`${styles.statusBadge} ${styles[user.status]}`}>
                    {user.status === "active" ? <CheckCircle size={14} /> : <Lock size={14} />}
                    {user.status}
                  </span>
                </td>
                <td className={styles.tableTd}>{user.joinDate}</td>
                <td className={styles.tableTd}>{user.lastActive}</td>
                <td className={styles.tableTd}>
                  <div className={styles.actionsCell}>
                    <button
                      onClick={() => setShowActionMenu(showActionMenu === user.id ? null : user.id)}
                      className={styles.actionMenuBtn}
                    >
                      <MoreVertical size={20} />
                    </button>
                    <AnimatePresence>
                      {showActionMenu === user.id && (
                        <ActionMenu
                          onClose={() => setShowActionMenu(null)}
                          actions={[
                            { icon: ArrowUpCircle, label: "Upgrade to Professional", onClick: () => onUpgradeToMaster(user.id), color: "blue" },
                            { icon: user.status === "active" ? UserX : UserCheck, label: user.status === "active" ? "Block User" : "Unblock User", onClick: () => onBlockUser(user.id), color: user.status === "active" ? "red" : "green" },
                            { icon: Trash2, label: "Delete User", onClick: () => onDeleteUser(user.id), color: "red" },
                          ]}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProfessionalManagementTable({
  professionals,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  onBlockUser,
  onDeleteUser,
  showActionMenu,
  setShowActionMenu,
}) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.filtersRow}>
        <div className={styles.filtersFlex}>
          <div className={styles.searchWrapper}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search professionals..."
              className={styles.searchInput}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.tableTh}>Professional</th>
              <th className={styles.tableTh}>Contact</th>
              <th className={styles.tableTh}>Performance</th>
              <th className={styles.tableTh}>Status</th>
              <th className={styles.tableTh}>Join Date</th>
              <th className={styles.tableTh}>Actions</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {professionals.map((professional) => (
              <tr key={professional.id}>
                <td className={styles.tableTd}>
                  <div className={styles.userCell}>
                    <div className={styles.userAvatar}>{professional.name.charAt(0)}</div>
                    <div>
                      <div className={styles.userName}>{professional.name}</div>
                      <div className={styles.userId}>ID: {professional.id}</div>
                    </div>
                  </div>
                </td>
                <td className={styles.tableTd}>
                  <div className={styles.contactRow}>
                    <Mail size={14} />
                    {professional.email}
                  </div>
                  <div className={`${styles.contactRow} ${styles.contactRowSecondary}`}>
                    <Phone size={14} />
                    {professional.phone}
                  </div>
                </td>
                <td className={styles.tableTd}>
                  <div className={styles.performanceCell}>
                    {professional.projectsCount || 0} Projects
                  </div>
                  <div className={styles.performanceRating}>
                    <span>⭐</span>
                    <span>{professional.rating?.toFixed(1) || "N/A"}</span>
                  </div>
                </td>
                <td className={styles.tableTd}>
                  <span className={`${styles.statusBadge} ${styles[professional.status]}`}>
                    {professional.status === "active" ? <CheckCircle size={14} /> : <Lock size={14} />}
                    {professional.status}
                  </span>
                </td>
                <td className={styles.tableTd}>{professional.joinDate}</td>
                <td className={styles.tableTd}>
                  <div className={styles.actionsCell}>
                    <button
                      onClick={() => setShowActionMenu(showActionMenu === professional.id ? null : professional.id)}
                      className={styles.actionMenuBtn}
                    >
                      <MoreVertical size={20} />
                    </button>
                    <AnimatePresence>
                      {showActionMenu === professional.id && (
                        <ActionMenu
                          onClose={() => setShowActionMenu(null)}
                          actions={[
                            { icon: Edit, label: "Edit Profile", onClick: () => setShowActionMenu(null), color: "blue" },
                            { icon: professional.status === "active" ? UserX : UserCheck, label: professional.status === "active" ? "Block Professional" : "Unblock Professional", onClick: () => onBlockUser(professional.id), color: professional.status === "active" ? "red" : "green" },
                            { icon: Trash2, label: "Delete Professional", onClick: () => onDeleteUser(professional.id), color: "red" },
                          ]}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddProfessionalModal({ show, onClose, onAdd }) {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      role: "professional",
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
      lastActive: "Just now",
      projectsCount: 0,
      rating: 5.0,
    });
    setFormData({ name: "", email: "", phone: "", password: "" });
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={styles.modalOverlay}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={styles.modalContent}
        >
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Add New Professional</h2>
            <button onClick={onClose} className={styles.modalCloseBtn}>
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={styles.formInput}
                placeholder="Enter full name"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={styles.formInput}
                placeholder="email@example.com"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={styles.formInput}
                placeholder="+995 XXX XXX XXX"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Initial Password *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={styles.formInput}
                placeholder="Minimum 8 characters"
                minLength={8}
              />
            </div>
            <div className={styles.modalActions}>
              <button type="button" onClick={onClose} className={`${styles.modalBtn} ${styles.modalBtnCancel}`}>
                Cancel
              </button>
              <button type="submit" className={`${styles.modalBtn} ${styles.modalBtnSubmit}`}>
                Add Professional
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);

  const stats = {
    totalUsers: 1247,
    totalProfessionals: 523,
    activeUsers: 1189,
    blockedAccounts: 58,
    newThisMonth: 87,
    growthRate: 12.5,
  };

  const [users, setUsers] = useState([
    { id: 1, name: "Giorgi Beridze", email: "giorgi@email.com", phone: "+995 555 123 456", role: "user", status: "active", joinDate: "2025-01-15", lastActive: "2 hours ago" },
    { id: 2, name: "Mariam Gelashvili", email: "mariam@email.com", phone: "+995 555 234 567", role: "professional", status: "active", joinDate: "2024-11-20", lastActive: "1 day ago", projectsCount: 23, rating: 4.8 },
    { id: 3, name: "Luka Kvaratskhelia", email: "luka@email.com", phone: "+995 555 345 678", role: "professional", status: "active", joinDate: "2024-09-10", lastActive: "5 minutes ago", projectsCount: 45, rating: 4.9 },
    { id: 4, name: "Nino Abashidze", email: "nino@email.com", phone: "+995 555 456 789", role: "user", status: "blocked", joinDate: "2025-02-01", lastActive: "1 week ago" },
    { id: 5, name: "Davit Chikovani", email: "davit@email.com", phone: "+995 555 567 890", role: "professional", status: "active", joinDate: "2024-12-05", lastActive: "3 hours ago", projectsCount: 12, rating: 4.6 },
  ]);

  const handleBlockUser = (userId) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, status: user.status === "active" ? "blocked" : "active" } : user)));
    setShowActionMenu(null);
  };

  const handleUpgradeToMaster = (userId) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, role: "professional", projectsCount: 0, rating: 5.0 } : user)));
    setShowActionMenu(null);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user.id !== userId));
      setShowActionMenu(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const usersList = filteredUsers.filter((u) => u.role === "user");
  const professionalsList = filteredUsers.filter((u) => u.role === "professional");

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.container}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.headerIcon}>
              <Shield size={24} />
            </div>
            <div>
              <h1 className={styles.headerTitle}>Admin Dashboard</h1>
              <p className={styles.headerSubtitle}>Manage users and professionals</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={styles.tabsWrapper}>
          <div className={styles.tabsContainer}>
            <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={Activity}>
              Overview
            </TabButton>
            <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={Users}>
              Users ({usersList.length})
            </TabButton>
            <TabButton active={activeTab === "professionals"} onClick={() => setActiveTab("professionals")} icon={Briefcase}>
              Professionals ({professionalsList.length})
            </TabButton>
          </div>
        </motion.div>

        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className={styles.statsGrid}>
              <StatCard icon={Users} title="Total Users" value={stats.totalUsers} color="blue" delay={0} />
              <StatCard icon={Briefcase} title="Total Professionals" value={stats.totalProfessionals} color="teal" delay={0.1} />
              <StatCard icon={UserCheck} title="Active Users" value={stats.activeUsers} color="green" delay={0.2} />
              <StatCard icon={UserX} title="Blocked Accounts" value={stats.blockedAccounts} color="red" delay={0.3} />
              <StatCard icon={TrendingUp} title="New This Month" value={stats.newThisMonth} color="purple" delay={0.4} />
              <StatCard icon={Activity} title="Growth Rate" value={`${stats.growthRate}%`} color="orange" delay={0.5} />
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className={`${styles.card} ${styles.cardLarge}`}>
              <h2 className={styles.cardTitle}>Quick Actions</h2>
              <div className={styles.quickActionsGrid}>
                <QuickActionButton icon={Plus} label="Add New Professional" onClick={() => setShowAddModal(true)} />
                <QuickActionButton icon={Users} label="View All Users" onClick={() => setActiveTab("users")} />
                <QuickActionButton icon={Briefcase} label="View All Professionals" onClick={() => setActiveTab("professionals")} />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className={`${styles.card} ${styles.cardLarge} ${styles.sectionSpacing}`}>
              <h2 className={styles.cardTitle}>Recent Activity</h2>
              <div className={styles.activityList}>
                <ActivityItem icon={UserCheck} text="Mariam Gelashvili completed a project" time="2 hours ago" />
                <ActivityItem icon={Plus} text="New user Giorgi Beridze joined" time="5 hours ago" />
                <ActivityItem icon={ArrowUpCircle} text="Luka Kvaratskhelia upgraded to Professional" time="1 day ago" />
                <ActivityItem icon={UserX} text="User account blocked for policy violation" time="2 days ago" />
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <UserManagementTable users={usersList} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filterStatus={filterStatus} setFilterStatus={setFilterStatus} onBlockUser={handleBlockUser} onUpgradeToMaster={handleUpgradeToMaster} onDeleteUser={handleDeleteUser} showActionMenu={showActionMenu} setShowActionMenu={setShowActionMenu} />
          </motion.div>
        )}

        {activeTab === "professionals" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className={styles.headerRow}>
              <h2 className={styles.headerRowTitle}>Professional Management</h2>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAddModal(true)} className={styles.addProfessionalBtn}>
                <Plus size={20} />
                Add Professional
              </motion.button>
            </div>
            <ProfessionalManagementTable professionals={professionalsList} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filterStatus={filterStatus} setFilterStatus={setFilterStatus} onBlockUser={handleBlockUser} onDeleteUser={handleDeleteUser} showActionMenu={showActionMenu} setShowActionMenu={setShowActionMenu} />
          </motion.div>
        )}
      </div>

      <AddProfessionalModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(newProfessional) => {
          setUsers([...users, { ...newProfessional, id: users.length + 1 }]);
          setShowAddModal(false);
        }}
      />
    </div>
  );
}
