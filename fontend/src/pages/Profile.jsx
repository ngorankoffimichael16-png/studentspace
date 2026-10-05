import { useEffect, useState } from "react"
import axios from "axios"
import { apiUrl } from "@/lib/api"
import Sidebar from "../components/layout/Sidebar/Sidebar.jsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { Search, Bell, Menu, ChevronRight, Camera } from "lucide-react"

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorSetup, setTwoFactorSetup] = useState(null)
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [twoFactorMessage, setTwoFactorMessage] = useState("")
  const [isTwoFactorBusy, setIsTwoFactorBusy] = useState(false)
  const [isDisablingTwoFactor, setIsDisablingTwoFactor] = useState(false)
  const [photo, setPhoto] = useState("")
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState("")
  const [profileSaveMessage, setProfileSaveMessage] = useState("")
  const [photoMessage, setPhotoMessage] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    school: "",
    field: "",
  })
const navigate = useNavigate()
  // Charge les informations du compte après vérification du jeton par le backend.
  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      let token

      try {
        // Récupère le jeton enregistré lors de la connexion.
        token = sessionStorage.getItem("token")
      } catch {
        if (isMounted) {
          setProfileMessage("Le navigateur ne permet pas d’accéder à la session.")
          setIsLoadingProfile(false)
        }
        return
      }

      if (!token) {
        if (isMounted) {
          setProfileMessage("Aucune session active. Connecte-toi de nouveau.")
          setIsLoadingProfile(false)
        }
        return
      }

      try {
        // Demande au backend les vraies informations du compte connecté.
        const response = await axios.get(apiUrl("/api/auth/me"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const user = response.data?.user

        if (!user) {
          throw new Error("Le backend n’a pas renvoyé le compte utilisateur.")
        }

        if (isMounted) {
          // Remplace les valeurs de démonstration par celles de la base.
          setFormData((currentData) => ({
            ...currentData,
            fullName: user.fullName || "",
            email: user.email || "",
            phone: user.phone || "",
          }))
          setTwoFactorEnabled(user.twoFactorEnabled === true)

          // Le serveur héberge la photo et la base fournit son chemin.
          setPhoto(
            user.avatarPath
              ? apiUrl(user.avatarPath)
              : ""
          )
        }
      } catch (error) {
        if (isMounted) {
          setProfileMessage(
            error.response?.data?.message ||
              error.message ||
              "Impossible de charger les informations du profil."
          )
        }
      } finally {
        if (isMounted) setIsLoadingProfile(false)
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Envoie la photo choisie au backend pour vérification et stockage.
  const handlePhotoChange = async (e) => {
    const input = e.currentTarget
    const file = input.files?.[0]
    if (!file) return

    setPhotoMessage("")

    // Vérifie côté navigateur les mêmes formats et la même limite que le backend.
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      setPhotoMessage("Choisis une image JPEG, PNG ou WebP.")
      input.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoMessage("La photo ne doit pas dépasser 5 Mo.")
      input.value = ""
      return
    }

    let token
    try {
      // La route d'upload est privée : récupère le jeton de la session.
      token = sessionStorage.getItem("token")
    } catch {
      setPhotoMessage("Le navigateur ne permet pas d’accéder à la session.")
      input.value = ""
      return
    }

    if (!token) {
      setPhotoMessage("Connecte-toi avant de modifier ta photo.")
      input.value = ""
      return
    }

    // FormData transmet le fichier sous le champ attendu par Multer : "photo".
    const photoData = new FormData()
    photoData.append("photo", file)
    setIsUploadingPhoto(true)

    try {
      const response = await axios.post(
        apiUrl("/api/users/me/avatar"),
        photoData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const avatarPath = response.data?.user?.avatarPath
      if (!avatarPath) {
        throw new Error("Le backend n’a pas renvoyé le chemin de la photo.")
      }

      // Affiche le fichier enregistré sur le serveur, pas un aperçu temporaire.
      setPhoto(apiUrl(avatarPath))
      setPhotoMessage(response.data.message || "Photo de profil enregistrée.")
    } catch (error) {
      setPhotoMessage(
        error.response?.data?.message ||
          error.message ||
          "Impossible d’envoyer la photo."
      )
    } finally {
      setIsUploadingPhoto(false)
      // Permet de sélectionner à nouveau le même fichier après une erreur.
      input.value = ""
    }
  }

  // Prépare les initiales affichées si le compte n'a pas encore de photo.
  const initials =
    formData.fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name[0].toUpperCase())
      .join("") || "?"

  // Envoie les informations du profil au backend.
  const handleSubmit = async () => {
    setProfileSaveMessage("")

    let token

    try {
      // La connexion enregistre le jeton dans la session du navigateur.
      token = sessionStorage.getItem("token")
    } catch {
      setProfileSaveMessage("Impossible d’accéder à la session du navigateur.")
      return
    }

    if (!token) {
      setProfileSaveMessage("Session absente. Déconnecte-toi puis reconnecte-toi.")
      return
    }

    setIsSavingProfile(true)

    try {
      const response = await axios.patch(
        apiUrl("/api/users/me"),
        {
          // Ces champs correspondent aux colonnes déjà présentes dans la table users.
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
        },
        {
          // Le backend utilise le jeton pour identifier le compte connecté.
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const user = response.data?.user

      if (!user) {
        throw new Error("Le backend n’a pas renvoyé le profil mis à jour.")
      }

      // Affiche les valeurs confirmées par le backend.
      setFormData((currentData) => ({
        ...currentData,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
      }))

      setProfileSaveMessage(response.data.message || "Profil enregistré.")
    } catch (error) {
      setProfileSaveMessage(
        error.response?.data?.message ||
          error.message ||
          "Impossible d’enregistrer le profil."
      )
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Lit le jeton de session nécessaire aux routes privées de sécurité.
  const getTwoFactorSessionToken = () => {
    try {
      const token = sessionStorage.getItem("token")

      if (!token) {
        setTwoFactorMessage("Session absente. Reconnecte-toi avant de continuer.")
        return null
      }

      return token
    } catch {
      setTwoFactorMessage("Le navigateur ne permet pas d’accéder à la session.")
      return null
    }
  }

  // Demande au backend un QR code et une clé de configuration.
  const handleStartTwoFactorSetup = async () => {
    const token = getTwoFactorSessionToken()
    if (!token) return

    setIsTwoFactorBusy(true)
    setTwoFactorMessage("")

    try {
      const response = await axios.post(
        apiUrl("/api/users/me/two-factor/setup"),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const { qrCodeDataUrl, manualSecret } = response.data || {}
      if (!qrCodeDataUrl || !manualSecret) {
        throw new Error("Le backend n’a pas renvoyé les éléments de configuration.")
      }

      // Garde les éléments en mémoire seulement pendant l'écran de configuration.
      setTwoFactorSetup({ qrCodeDataUrl, manualSecret })
      setTwoFactorCode("")
      setTwoFactorMessage("Scanne le QR code, puis saisis le code affiché par l’application.")
    } catch (error) {
      setTwoFactorMessage(
        error.response?.data?.message ||
          error.message ||
          "Impossible de préparer la configuration 2FA."
      )
    } finally {
      setIsTwoFactorBusy(false)
    }
  }

  // Envoie le premier code pour activer réellement la protection du compte.
  const handleConfirmTwoFactorSetup = async () => {
    if (!/^\d{6}$/.test(twoFactorCode)) {
      setTwoFactorMessage("Saisis un code valide de 6 chiffres.")
      return
    }

    const token = getTwoFactorSessionToken()
    if (!token) return

    setIsTwoFactorBusy(true)

    try {
      const response = await axios.post(
        apiUrl("/api/users/me/two-factor/confirm"),
        { token: twoFactorCode },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data?.enabled !== true) {
        throw new Error("Le backend n’a pas confirmé l’activation de la 2FA.")
      }

      setTwoFactorEnabled(true)
      setTwoFactorSetup(null)
      setTwoFactorCode("")
      setTwoFactorMessage(response.data.message || "La 2FA est activée.")
    } catch (error) {
      setTwoFactorMessage(
        error.response?.data?.message ||
          error.message ||
          "Impossible de confirmer le code."
      )
    } finally {
      setIsTwoFactorBusy(false)
    }
  }

  // Demande d'abord le code actuel avant de montrer la confirmation de désactivation.
  const handleBeginTwoFactorDisable = () => {
    setIsDisablingTwoFactor(true)
    setTwoFactorCode("")
    setTwoFactorMessage("Saisis le code actuel de ton application pour désactiver la 2FA.")
  }

  // Désactive la 2FA côté serveur uniquement après vérification du code actuel.
  const handleDisableTwoFactor = async () => {
    if (!/^\d{6}$/.test(twoFactorCode)) {
      setTwoFactorMessage("Saisis un code valide de 6 chiffres.")
      return
    }

    const token = getTwoFactorSessionToken()
    if (!token) return

    setIsTwoFactorBusy(true)

    try {
      const response = await axios.post(
        apiUrl("/api/users/me/two-factor/disable"),
        { token: twoFactorCode },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data?.enabled !== false) {
        throw new Error("Le backend n’a pas confirmé la désactivation.")
      }

      setTwoFactorEnabled(false)
      setIsDisablingTwoFactor(false)
      setTwoFactorCode("")
      setTwoFactorMessage(response.data.message || "La 2FA est désactivée.")
    } catch (error) {
      setTwoFactorMessage(
        error.response?.data?.message ||
          error.message ||
          "Impossible de désactiver la 2FA."
      )
    } finally {
      setIsTwoFactorBusy(false)
    }
  }

  const handleChangePassword = () => {
    console.log("Modification du mot de passe demandée")
  }

  // Termine la session de cet appareil et retourne à la page de connexion.
const handleLogoutDevice = () => {
  try {
    sessionStorage.removeItem("token")
  } catch {
    window.alert("Impossible de supprimer la session dans ce navigateur.")
    return
  }

  navigate("/login", { replace: true })
}

  return (
    <div className="flex min-h-screen w-full min-w-0 bg-[#F8FAFC] text-dark antialiased">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-8">
        <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-4 sm:gap-6">

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:flex-nowrap sm:p-4">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <button onClick={() => setSidebarOpen(true)} className="shrink-0 text-slate-600 lg:hidden" aria-label="Ouvrir le menu">
                <Menu size={22} />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">Mon profil</h1>
                <p className="text-[11px] leading-snug text-slate-500 sm:text-xs">Gérez vos informations personnelles.</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3 md:gap-6">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  className="bg-slate-50 text-xs pl-9 pr-4 py-2 rounded-xl border-slate-100 w-60 h-9"
                />
              </div>

              <div className="relative flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                <Bell className="text-slate-500 w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </div>

              <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <Avatar className="h-8 w-8 shrink-0 sm:h-9 sm:w-9">
                  <AvatarImage src={photo} alt={formData.fullName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col select-none">
                  <span className="text-xs font-bold text-slate-900 leading-tight">{formData.fullName}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{formData.email}</span>
                </div>
              </div>
            </div>
          </div>

          <Card className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm ring-0">
            <CardContent className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <label className="relative cursor-pointer group" aria-label="Changer la photo de profil">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={photo} alt={formData.fullName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera size={16} className="text-white" />
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    disabled={isUploadingPhoto}
                    className="hidden"
                  />
                </label>
                <div aria-live="polite">
                  {isUploadingPhoto && (
                    <p className="text-xs text-slate-500">Envoi de la photo…</p>
                  )}
                  {photoMessage && (
                    <p className="text-xs text-slate-600">{photoMessage}</p>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words text-base font-bold text-slate-900">{formData.fullName}</h2>
                    <Badge className="shrink-0 bg-purple-100 text-purple-600 hover:bg-purple-100">Étudiant</Badge>
                  </div>
                  <p className="break-all text-sm text-slate-400">{formData.email}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full sm:w-fit">Modifier le profil</Button>
            </CardContent>
          </Card>

            {isLoadingProfile && (
              <p className="text-sm text-slate-500" role="status">
                Chargement du profil…
              </p>
            )}
            {profileMessage && (
              <p className="text-sm text-red-600" role="alert">
                {profileMessage}
              </p>
            )}

            {/* items-start évite l'étirement vertical et conserve une colonne sécurité lisible. */}
            <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
              {/* La carte d'informations occupe la première colonne. */}
              <Card className="min-w-0 self-start rounded-2xl border border-slate-200 bg-white shadow-sm ring-0">
                <CardHeader className="pb-1">
                  <CardTitle className="text-lg font-bold text-slate-900">Informations personnelles</CardTitle>
                  <p className="text-sm leading-relaxed text-slate-500">
                    Mets à jour les coordonnées associées à ton compte.
                  </p>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 sm:gap-y-5">
                  <div className="min-w-0">
                    <Label htmlFor="fullName" className="text-sm font-medium text-slate-600">Nom complet</Label>
                    <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} className="mt-2 h-11 rounded-xl border-slate-200 bg-slate-50/70 px-3 text-sm shadow-sm focus-visible:bg-white" />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="phone" className="text-sm font-medium text-slate-600">Numéro de téléphone</Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className="mt-2 h-11 rounded-xl border-slate-200 bg-slate-50/70 px-3 text-sm shadow-sm focus-visible:bg-white" />
                  </div>
                  <div className="min-w-0 sm:col-span-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-600">Adresse e-mail</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="mt-2 h-11 rounded-xl border-slate-200 bg-slate-50/70 px-3 text-sm shadow-sm focus-visible:bg-white" />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="school" className="text-sm font-medium text-slate-600">Établissement</Label>
                    <Input id="school" name="school" value={formData.school} onChange={handleChange} className="mt-2 h-11 rounded-xl border-slate-200 bg-slate-50/70 px-3 text-sm shadow-sm focus-visible:bg-white" />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="field" className="text-sm font-medium text-slate-600">Filière</Label>
                    <Input id="field" name="field" value={formData.field} onChange={handleChange} className="mt-2 h-11 rounded-xl border-slate-200 bg-slate-50/70 px-3 text-sm shadow-sm focus-visible:bg-white" />
                  </div>

                <Button
                  className="mt-1 h-10 w-full rounded-lg px-4 font-semibold shadow-sm sm:col-span-2 sm:w-fit"
                  onClick={handleSubmit}
                  disabled={isSavingProfile || isLoadingProfile}
                >
                  {isSavingProfile
                    ? "Enregistrement…"
                    : "Enregistrer les modifications"}
                </Button>
                {profileSaveMessage && (
                  <p
                    className="text-sm text-slate-600 sm:col-span-2"
                    role="status"
                    aria-live="polite"
                  >
                    {profileSaveMessage}
                  </p>
                )}
                </CardContent>
              </Card>

            <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
              {/* Cette carte garde un contour doux dans la colonne de sécurité. */}
              <Card className="min-w-0 self-start rounded-2xl border border-slate-200 bg-white shadow-sm ring-0">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-900">Sécurité du compte</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <button
                    onClick={handleChangePassword}
                    className="flex w-full min-w-0 items-center justify-between gap-3 text-left text-sm text-slate-700 transition-colors hover:text-slate-900"
                  >
                    <span className="min-w-0">Modifier le mot de passe</span>
                    <ChevronRight size={16} className="shrink-0 text-slate-400" />
                  </button>
                  <section className="min-w-0 rounded-xl bg-slate-50 p-3 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Authentification à deux facteurs
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
                          {twoFactorEnabled
                            ? "Un code de ton application sera demandé à la connexion."
                            : "Ajoute un code temporaire à ta connexion."}
                        </p>
                      </div>
                      <span
                        className={`w-fit shrink-0 self-start rounded-full px-2.5 py-1 text-xs font-semibold ${
                          twoFactorEnabled
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {twoFactorEnabled ? "Activée" : "Désactivée"}
                      </span>
                    </div>

                    {!twoFactorEnabled && !twoFactorSetup && (
                      <Button
                        type="button"
                        className="mt-4 h-auto min-h-10 w-full min-w-0 whitespace-normal px-4 py-2 text-center leading-snug sm:w-auto"
                        onClick={handleStartTwoFactorSetup}
                        disabled={isTwoFactorBusy || isLoadingProfile}
                      >
                        {isTwoFactorBusy ? "Préparation…" : "Configurer la 2FA"}
                      </Button>
                    )}

                    {!twoFactorEnabled && twoFactorSetup && (
                      <div className="mt-4 flex flex-col gap-3">
                        <p className="text-sm text-slate-700">
                          Scanne ce QR code avec Google Authenticator, Authy ou une application compatible.
                        </p>
                        <img
                          src={twoFactorSetup.qrCodeDataUrl}
                          alt="QR code de configuration de l’authentification à deux facteurs"
                          className="mx-auto h-44 w-44 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:mx-0"
                        />
                        <p className="text-xs text-slate-600">
                          Si tu ne peux pas scanner le QR, saisis cette clé dans ton application :
                        </p>
                        <code className="block max-w-full break-all rounded-lg bg-white p-3 font-mono text-xs leading-relaxed text-slate-700">
                          {twoFactorSetup.manualSecret}
                        </code>
                        <div>
                          <Label htmlFor="twoFactorSetupCode">
                            Code de confirmation à 6 chiffres
                          </Label>
                          <Input
                            id="twoFactorSetupCode"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={twoFactorCode}
                            onChange={(event) =>
                              setTwoFactorCode(
                                event.target.value.replace(/\D/g, "").slice(0, 6)
                              )
                            }
                            className="mt-1 max-w-xs tracking-[0.3em]"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            onClick={handleConfirmTwoFactorSetup}
                            disabled={isTwoFactorBusy || twoFactorCode.length !== 6}
                          >
                            {isTwoFactorBusy ? "Vérification…" : "Confirmer et activer"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setTwoFactorSetup(null)
                              setTwoFactorCode("")
                              setTwoFactorMessage("")
                            }}
                            disabled={isTwoFactorBusy}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    )}

                    {twoFactorEnabled && !isDisablingTwoFactor && (
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-600"
                        onClick={handleBeginTwoFactorDisable}
                      >
                        Désactiver la 2FA
                      </Button>
                    )}

                    {twoFactorEnabled && isDisablingTwoFactor && (
                      <div className="mt-4 flex flex-col gap-3">
                        <div>
                          <Label htmlFor="twoFactorDisableCode">
                            Code actuel de l’application
                          </Label>
                          <Input
                            id="twoFactorDisableCode"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={twoFactorCode}
                            onChange={(event) =>
                              setTwoFactorCode(
                                event.target.value.replace(/\D/g, "").slice(0, 6)
                              )
                            }
                            className="mt-1 max-w-xs tracking-[0.3em]"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-600"
                            onClick={handleDisableTwoFactor}
                            disabled={isTwoFactorBusy || twoFactorCode.length !== 6}
                          >
                            {isTwoFactorBusy ? "Vérification…" : "Confirmer la désactivation"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsDisablingTwoFactor(false)
                              setTwoFactorCode("")
                              setTwoFactorMessage("")
                            }}
                            disabled={isTwoFactorBusy}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    )}

                    {twoFactorMessage && (
                      <p className="mt-3 text-sm text-slate-600" role="status" aria-live="polite">
                        {twoFactorMessage}
                      </p>
                    )}
                  </section>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-2xl border border-red-100">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-red-600">Zone de danger</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p className="text-xs text-slate-500">
                    La déconnexion fermera votre session active actuelle. Pour supprimer définitivement vos données, veuillez contacter l'administration.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full whitespace-normal border-red-300 py-2 text-center text-red-600 hover:bg-red-50 hover:text-red-600 sm:w-fit"
                    onClick={handleLogoutDevice}
                  >
                    Se déconnecter de l'appareil
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>

        </div>
      </main>
    </div>
  )
}