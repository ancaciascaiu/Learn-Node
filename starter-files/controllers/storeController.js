const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
	req.flash('error')
	res.render('index');
};

exports.addStore = (req, res) => {
	res.render('editStore', {title: 'Add Store' });
};

exports.createStore = async (req, res) => {
	const store = await (new Store(req.body)).save();
	req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
	res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
	const stores = await Store.find();
	res.render('stores', { title: 'Stores', stores: stores });
};

exports.editStore = async (req, res) => {
	//Find the sore given the ID
	const store = await Store.findOne({ _id: req.params.id });
	//confirm they are the owner of that store
	//TODO
	//render out the edit form so the user can update it
	res.render('editStore', { title: `Edit ${store.name}`, store: store })
};

exports.updateStore = async (req, res) => {
	//find and update the store
	const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
		new: true, //return the new store instead of the old one
		runValidators: true
	}).exec();
	req.flash('succes', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store -></a>`);
	//redirect 
	res.redirect(`/stores/${store._id}/edit`);
};
