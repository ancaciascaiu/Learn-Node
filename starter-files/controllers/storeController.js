const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
	//where do we store the photos
	storage: multer.memoryStorage(),
	//what type of files are allowed
	fileFilter(req, file, next) {
		const isPhoto = file.mimetype.startsWith('image/');
		if(isPhoto) {
			next(null, true);
		} else {
			next({ message: 'That filetype isn\'t allowed!'}, false);
		}
	}
};

exports.homePage = (req, res) => {
	req.flash('error')
	res.render('index');
};

exports.addStore = (req, res) => {
	res.render('editStore', {title: 'Add Store' });
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async(req, res, next) => {
	//check if there's no new file to resize
	if( !req.file){
		next(); //skip to the next middleware
		return;
	}
	const extension = req.file.mimetype.split('/')[1];
	req.body.photo = `${uuid.v4()}.${extension}`;
	//now we resize
	const photo = await jimp.read(req.file.buffer);
	await photo.resize(800, jimp.AUTO);
	await photo.write(`./public/uploads/${req.body.photo}`);
	//after writing the photo to our filesystem, keep going!
	next();
}

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
	//set the location data to be a point
	req.body.location.type = 'Point'; 
	//find and update the store
	const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
		new: true, //return the new store instead of the old one
		runValidators: true
	}).exec();
	req.flash('succes', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store -></a>`);
	//redirect 
	res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoreBySlug = async(req, res) => {
	const store = await Store.findOne({ slug: req.params.slug });
	if(!store) return next();
	res.render('store', { store, title: store.name });
}

exports.getStoresByTag = async (req, res) => {
	const tags = await Store.getTagsList();
	const tag = req.params.tag;
	res.render('tag', { tags: tags, title: 'Tags', tag })
}

