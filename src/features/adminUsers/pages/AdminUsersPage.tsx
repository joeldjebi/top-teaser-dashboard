import { Plus, ShieldCheck, Trash2, UserPlus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { ApiError } from '../../../lib/apiClient'
import { useConfirmDialog } from '../../../shared/confirm/ConfirmDialogProvider'
import { useAuth } from '../../auth/AuthProvider'
import type { PermissionMatrix, PermissionResource } from '../../auth/types'
import {
  createAdminRole,
  createAdminUser,
  deleteAdminUser,
  fetchAdminRoles,
  fetchAdminUsers,
} from '../api/adminUsersApi'
import type { AdminAccount, AdminRole } from '../types/adminUserTypes'

const resources: Array<{ key: PermissionResource; label: string }> = [
  { key: 'overview', label: 'Vue générale' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'contactLists', label: 'Catégories' },
  { key: 'templates', label: 'Templates' },
  { key: 'campaigns', label: 'Campagnes' },
  { key: 'logs', label: 'Logs' },
  { key: 'providers', label: 'Providers' },
  { key: 'admins', label: 'Admins' },
]

const actions = ['create', 'read', 'update', 'delete'] as const

function makePermissions(value = false): PermissionMatrix {
  return Object.fromEntries(
    resources.map((resource) => [
      resource.key,
      { create: value, read: value, update: value, delete: value },
    ]),
  ) as PermissionMatrix
}

export function AdminUsersPage() {
  const { token, user } = useAuth()
  const { confirm } = useConfirmDialog()
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [admins, setAdmins] = useState<AdminAccount[]>([])
  const [roleName, setRoleName] = useState('')
  const [roleDescription, setRoleDescription] = useState('')
  const [permissions, setPermissions] = useState<PermissionMatrix>(
    makePermissions(false),
  )
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    roleId: '',
  })
  const [createdInvitation, setCreatedInvitation] = useState<{
    email: string
    sent: boolean
    url?: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const canManage = Boolean(user?.permissions.admins.create)

  const load = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    setError(null)
    try {
      const [rolesResponse, adminsResponse] = await Promise.all([
        fetchAdminRoles(token),
        fetchAdminUsers(token),
      ])
      setRoles(rolesResponse.data)
      setAdmins(adminsResponse.data)
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : 'Impossible de charger les admins.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  const stats = useMemo(
    () => ({
      admins: admins.length,
      roles: roles.length,
      fullRoles: roles.filter((role) =>
        Object.values(role.permissions).every((permission) =>
          Object.values(permission).every(Boolean),
        ),
      ).length,
    }),
    [admins, roles],
  )

  async function handleCreateRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await createAdminRole(token, {
        name: roleName,
        description: roleDescription || null,
        permissions,
      })
      setRoleName('')
      setRoleDescription('')
      setPermissions(makePermissions(false))
      setSuccess('Rôle créé.')
      await load()
    } catch (roleError) {
      setError(
        roleError instanceof ApiError
          ? roleError.message
          : 'Impossible de créer le rôle.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCreateAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const created = await createAdminUser(token, {
        name: adminForm.name,
        email: adminForm.email,
        roleId: Number(adminForm.roleId),
      })
      setCreatedInvitation({
        email: adminForm.email,
        sent: created.invitationEmailSent,
        url: created.invitationUrl,
      })
      setAdminForm({ name: '', email: '', roleId: '' })
      setSuccess(created.message)
      await load()
    } catch (adminError) {
      setError(
        adminError instanceof ApiError
          ? adminError.message
          : 'Impossible de créer cet admin.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteAdmin(admin: AdminAccount) {
    if (!token) return
    const shouldDelete = await confirm({
      title: 'Supprimer cet admin ?',
      description: `Le compte « ${admin.name} » sera supprimé.`,
      confirmLabel: 'Supprimer',
      variant: 'danger',
    })
    if (!shouldDelete) return
    await deleteAdminUser(token, admin.id)
    await load()
  }

  function togglePermission(
    resource: PermissionResource,
    action: (typeof actions)[number],
  ) {
    setPermissions((current) => ({
      ...current,
      [resource]: {
        ...current[resource],
        [action]: !current[resource][action],
      },
    }))
  }

  return (
    <div className="admin-users-page">
      <section className="page-hero compact-hero">
        <div>
          <p className="eyebrow">Équipe</p>
          <h1>Gérez les admins, rôles et permissions.</h1>
          <p className="muted">
            Les permissions sont définies module par module, jusqu’aux actions
            créer, lire, modifier et supprimer.
          </p>
        </div>
      </section>

      <section className="insight-grid">
        <div className="insight-card">
          <UserPlus size={20} />
          <span>Admins</span>
          <strong>{stats.admins}</strong>
        </div>
        <div className="insight-card">
          <ShieldCheck size={20} />
          <span>Rôles</span>
          <strong>{stats.roles}</strong>
        </div>
        <div className="insight-card">
          <Plus size={20} />
          <span>Rôles complets</span>
          <strong>{stats.fullRoles}</strong>
        </div>
      </section>

      {error ? <div className="form-alert">{error}</div> : null}
      {success ? <div className="success-alert">{success}</div> : null}
      {createdInvitation ? (
        <div className="admin-password-notice">
          <div>
            <p className="eyebrow">Invitation admin</p>
            <strong>{createdInvitation.email}</strong>
            <span>
              {createdInvitation.sent
                ? 'Le lien sécurisé a été envoyé par email via le provider actif.'
                : 'L’email n’a pas pu être envoyé. Copiez ce lien maintenant, il ne sera plus affiché après actualisation.'}
            </span>
          </div>
          {createdInvitation.url ? <code>{createdInvitation.url}</code> : null}
        </div>
      ) : null}

      <section className="admin-users-grid">
        <form className="admin-panel stack-form" onSubmit={handleCreateRole}>
          <div>
            <p className="eyebrow">Rôles</p>
            <h2>Nouveau rôle</h2>
          </div>
          <label className="field">
            <span>Nom du rôle</span>
            <input
              disabled={!canManage}
              onChange={(event) => setRoleName(event.target.value)}
              required
              value={roleName}
            />
          </label>
          <label className="field">
            <span>Description</span>
            <input
              disabled={!canManage}
              onChange={(event) => setRoleDescription(event.target.value)}
              value={roleDescription}
            />
          </label>
          <div className="permissions-matrix">
            <div className="permissions-row header">
              <span>Module</span>
              {actions.map((action) => (
                <strong key={action}>{action}</strong>
              ))}
            </div>
            {resources.map((resource) => (
              <div className="permissions-row" key={resource.key}>
                <span>{resource.label}</span>
                {actions.map((action) => (
                  <input
                    checked={permissions[resource.key][action]}
                    disabled={!canManage}
                    key={action}
                    onChange={() => togglePermission(resource.key, action)}
                    type="checkbox"
                  />
                ))}
              </div>
            ))}
          </div>
          <button className="primary-button" disabled={!canManage || isSaving}>
            Créer le rôle
          </button>
        </form>

        <form className="admin-panel stack-form" onSubmit={handleCreateAdmin}>
          <div>
            <p className="eyebrow">Admins</p>
            <h2>Créer un admin</h2>
          </div>
          <label className="field">
            <span>Nom</span>
            <input
              disabled={!canManage}
              onChange={(event) =>
                setAdminForm((current) => ({ ...current, name: event.target.value }))
              }
              required
              value={adminForm.name}
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              disabled={!canManage}
              onChange={(event) =>
                setAdminForm((current) => ({ ...current, email: event.target.value }))
              }
              required
              type="email"
              value={adminForm.email}
            />
          </label>
          <label className="field">
            <span>Rôle</span>
            <select
              disabled={!canManage}
              onChange={(event) =>
                setAdminForm((current) => ({
                  ...current,
                  roleId: event.target.value,
                }))
              }
              required
              value={adminForm.roleId}
            >
              <option value="">Sélectionner un rôle</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
          <button className="primary-button" disabled={!canManage || isSaving}>
            Créer l’admin
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <div>
          <p className="eyebrow">Utilisateurs</p>
          <h2>Admins enregistrés</h2>
        </div>
        {isLoading ? (
          <div className="loading-state">Chargement des admins...</div>
        ) : (
          <div className="admin-list">
            {admins.map((admin) => (
              <div className="admin-row" key={admin.id}>
                <div>
                  <strong>{admin.name}</strong>
                  <span>{admin.email}</span>
                </div>
                <span className="provider-status-badge provider-status-ready">
                  {admin.roleName}
                </span>
                <button
                  className="icon-button danger"
                  disabled={!user?.permissions.admins.delete || admin.id === user.id}
                  onClick={() => handleDeleteAdmin(admin)}
                  type="button"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
