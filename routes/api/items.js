const router = require('express').Router();
const Item = require('../../models/Item');


    // routes //

// GET
router.get('/', (req, res) => {
    Item.find()
    .sort({date: -1})
    .then(items => res.json(items))
})

// POST
router.post('/', (req, res) => {
    const newItem = new Item({
        name: req.body.name
    });

    newItem.save().then(item => res.json(item));
})

//DELETE
router.delete('/:id', (req, res) => {
    Item.findById(req.paramas.id)
    .then(item => item.remove().then(() => res.json({ success: true})))
    .catch(err => res.status(404).json({success: false}))
})



module.exports = router;