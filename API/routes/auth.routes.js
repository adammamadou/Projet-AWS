const {Router} = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator')
const User = require('../models/User')
const config = require('config')
const router = Router()


router.post(
    '/register',
    [
        check('email', 'Adresse Email incorrecte').isEmail(),
        check('password', 'Longueur minimale du mot de passe 4 caractères').isLength({min:4})
    ], 
    async (req, res)=> {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: "Données d'enregistrement incorrectes!"
            })
        }

        const {email, password} = req.body
        const candidate = await User.findOne({email})
        if (candidate) {
            return res.status(400).json({message: "l'utilisateur existe déjà"})
        }
        else{
            const hashedPassword = await bcrypt.hash(password, 12)
            const user = new User({email, password: hashedPassword})
            await user.save()
            res.status(201).json({message: 'utilisateur créé'})
        }

    } catch(e) {
        res.status(500).json({message: "Une erreur s'est produite !"})
    }
})

router.post(
    '/login',
    [
      check('email', 'Veuillez saisir email correct').normalizeEmail().isEmail(),
      check('password', 'Entrer le mot de passe').exists()  
    ],
    async (req, res)=> {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: "Données de connexion non valides"
            })
        }

        const {email, password} = req.body

        const user = await User.findOne({email})

        if(!user) {
            return res.status(400).json({mesmsage: 'utilisateur introuvable!'})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch) {
            return res.status(400).json({message: 'Mot de passe incorrect'})
        }

        const token = jwt.sign(
            { userId: user.id },
            config.get('jwtSecret'),
            {expiresIn: '1h'}
        )

        res.json({token, userId: user.id})

    } catch(e) {
        res.status(500).json({message: "Une erreur s'est produite ..."})
    }
})

module.exports = router