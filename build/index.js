(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Backbone = require('backbone');
Backbone.$ = jQuery;

var List = require('./views/combinations');
var Header = require('./views/header');
var Input = require('./views/input');

var data = require('./data');
var Combinations = require('./collections/combinations');
var combinations = new Combinations(data);

var list = new List({
	el: $('.list'),
	collection: combinations
});
var header = new Header({
	el: $('.header')
});
var input = new Input({
	el: $('.search'),
	collection: combinations
});

},{"./collections/combinations":6,"./data":7,"./views/combinations":12,"./views/header":13,"./views/input":14,"backbone":2}],2:[function(require,module,exports){
//     Backbone.js 1.1.2

//     (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(root, factory) {

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery', 'exports'], function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone = factory(root, exports, _, $);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore');
    factory(root, exports, _);

  // Finally, as a browser global.
  } else {
    root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this, function(root, Backbone, _, $) {

  // Initial Setup
  // -------------

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create local references to array methods we'll want to use later.
  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.1.2';

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = $;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = void 0;
        return this;
      }
      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeningTo = this._listeningTo;
      if (!listeningTo) return this;
      var remove = !name && !callback;
      if (!callback && typeof name === 'object') callback = this;
      if (obj) (listeningTo = {})[obj._listenId] = obj;
      for (var id in listeningTo) {
        obj = listeningTo[id];
        obj.off(name, callback, this);
        if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeningTo = this._listeningTo || (this._listeningTo = {});
      var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
      listeningTo[id] = obj;
      if (!callback && typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId('c');
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset           = options.unset;
      silent          = options.silent;
      changes         = [];
      changing        = this._changing;
      this._changing  = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes, prev = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = options;
        for (var i = 0, l = changes.length; i < l; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overridden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        if (!model.set(model.parse(resp, options), options)) return false;
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      var attrs, method, xhr, attributes = this.attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true}, options);

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !options.wait) {
        if (!this.set(attrs, options)) return false;
      } else {
        if (!this._validate(attrs, options)) return false;
      }

      // Set temporary attributes if `{wait: true}`.
      if (attrs && options.wait) {
        this.attributes = _.extend({}, attributes, attrs);
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = model.parse(resp, options);
        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
          return false;
        }
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch') options.attrs = attrs;
      xhr = this.sync(method, this, options);

      // Restore attributes.
      if (attrs && options.wait) this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (options.wait || model.isNew()) destroy();
        if (success) success(model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      if (this.isNew()) {
        options.success();
        return false;
      }
      wrapError(this, options);

      var xhr = this.sync('delete', this, options);
      if (!options.wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url') ||
        urlError();
      if (this.isNew()) return base;
      return base.replace(/([^\/])$/, '$1/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return !this.has(this.idAttribute);
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend(options || {}, { validate: true }));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  _.each(modelMethods, function(method) {
    Model.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.attributes);
      return _[method].apply(_, args);
    };
  });

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analagous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      var singular = !_.isArray(models);
      models = singular ? [models] : _.clone(models);
      options || (options = {});
      var i, l, index, model;
      for (i = 0, l = models.length; i < l; i++) {
        model = models[i] = this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byId[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model, options);
      }
      return singular ? models[0] : models;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      options = _.defaults({}, options, setOptions);
      if (options.parse) models = this.parse(models, options);
      var singular = !_.isArray(models);
      models = singular ? (models ? [models] : []) : _.clone(models);
      var i, l, id, model, attrs, existing, sort;
      var at = options.at;
      var targetModel = this.model;
      var sortable = this.comparator && (at == null) && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
      var toAdd = [], toRemove = [], modelMap = {};
      var add = options.add, merge = options.merge, remove = options.remove;
      var order = !sortable && add && remove ? [] : false;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (i = 0, l = models.length; i < l; i++) {
        attrs = models[i] || {};
        if (attrs instanceof Model) {
          id = model = attrs;
        } else {
          id = attrs[targetModel.prototype.idAttribute || 'id'];
        }

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.get(id)) {
          if (remove) modelMap[existing.cid] = true;
          if (merge) {
            attrs = attrs === model ? model.attributes : attrs;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(attrs, options);
          if (!model) continue;
          toAdd.push(model);
          this._addReference(model, options);
        }

        // Do not add multiple models with the same `id`.
        model = existing || model;
        if (order && (model.isNew() || !modelMap[model.id])) order.push(model);
        modelMap[model.id] = true;
      }

      // Remove nonexistent models if appropriate.
      if (remove) {
        for (i = 0, l = this.length; i < l; ++i) {
          if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
        }
        if (toRemove.length) this.remove(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (toAdd.length || (order && order.length)) {
        if (sortable) sort = true;
        this.length += toAdd.length;
        if (at != null) {
          for (i = 0, l = toAdd.length; i < l; i++) {
            this.models.splice(at + i, 0, toAdd[i]);
          }
        } else {
          if (order) this.models.length = 0;
          var orderedModels = order || toAdd;
          for (i = 0, l = orderedModels.length; i < l; i++) {
            this.models.push(orderedModels[i]);
          }
        }
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      // Unless silenced, it's time to fire all appropriate add/sort events.
      if (!options.silent) {
        for (i = 0, l = toAdd.length; i < l; i++) {
          (model = toAdd[i]).trigger('add', model, this, options);
        }
        if (sort || (order && order.length)) this.trigger('sort', this, options);
      }

      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i], options);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj] || this._byId[obj.id] || this._byId[obj.cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      if (_.isEmpty(attrs)) return first ? void 0 : [];
      return this[first ? 'find' : 'filter'](function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      // Run sort based on type of `comparator`.
      if (_.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(_.bind(this.comparator, this));
      }

      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (!(model = this._prepareModel(model, options))) return false;
      if (!options.wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(model, resp) {
        if (options.wait) collection.add(model, options);
        if (success) success(model, resp, options);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models);
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) return attrs;
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Internal method to create a model's ties to a collection.
    _addReference: function(model, options) {
      this._byId[model.cid] = model;
      if (model.id != null) this._byId[model.id] = model;
      if (!model.collection) model.collection = this;
      model.on('all', this._onModelEvent, this);
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model, options) {
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroy') this.remove(model, options);
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain', 'sample'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy', 'indexBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    options || (options = {});
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this.$el.remove();
      this.stopListening();
      return this;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) continue;

        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
      return this;
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
        this.setElement($el, false);
      } else {
        this.setElement(_.result(this, 'el'), false);
      }
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // If we're sending a `PATCH` request, and we're in an old Internet Explorer
    // that still has ActiveX enabled by default, override jQuery to use that
    // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
    if (params.type === 'PATCH' && noXhrPatch) {
      params.xhr = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  var noXhrPatch =
    typeof window !== 'undefined' && !!window.ActiveXObject &&
      !(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        router.execute(callback, args);
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        Backbone.history.trigger('route', router, name, args);
      });
      return this;
    },

    // Execute a route handler with the provided parameters.  This is an
    // excellent place to do pre-route setup or post-route cleanup.
    execute: function(callback, args) {
      if (callback) callback.apply(this, args);
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^/?]+)';
                   })
                   .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Cached regex for removing a trailing slash.
  var trailingSlash = /\/$/;

  // Cached regex for stripping urls of hash.
  var pathStripper = /#.*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Are we at the app root?
    atRoot: function() {
      return this.location.pathname.replace(/[^\/]$/, '$&/') === this.root;
    },

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          fragment = decodeURI(this.location.pathname + this.location.search);
          var root = this.root.replace(trailingSlash, '');
          if (!fragment.indexOf(root)) fragment = fragment.slice(root.length);
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      if (oldIE && this._wantsHashChange) {
        var frame = Backbone.$('<iframe src="javascript:0" tabindex="-1">');
        this.iframe = frame.hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        Backbone.$(window).on('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        Backbone.$(window).on('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = this.location;

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !this.atRoot()) {
          this.fragment = this.getFragment(null, true);
          this.location.replace(this.root + '#' + this.fragment);
          // Return immediately as browser will do redirect to new url
          return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && this.atRoot() && loc.hash) {
          this.fragment = this.getHash().replace(routeStripper, '');
          this.history.replaceState({}, document.title, this.root + this.fragment);
        }

      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.getHash(this.iframe));
      }
      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragment) {
      fragment = this.fragment = this.getFragment(fragment);
      return _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      var url = this.root + (fragment = this.getFragment(fragment || ''));

      // Strip the hash for matching.
      fragment = fragment.replace(pathStripper, '');

      if (this.fragment === fragment) return;
      this.fragment = fragment;

      // Don't include a trailing slash on the root.
      if (fragment === '' && url !== '/') url = url.slice(0, -1);

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error(model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  return Backbone;

}));

},{"underscore":5}],3:[function(require,module,exports){

},{}],4:[function(require,module,exports){
'use strict';

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = merge(attrs, a[i]);
    }
    return attrs;
  }
  var ac = a['class'];
  var bc = b['class'];

  if (ac || bc) {
    ac = ac || [];
    bc = bc || [];
    if (!Array.isArray(ac)) ac = [ac];
    if (!Array.isArray(bc)) bc = [bc];
    a['class'] = ac.concat(bc).filter(nulls);
  }

  for (var key in b) {
    if (key != 'class') {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Filter null `val`s.
 *
 * @param {*} val
 * @return {Boolean}
 * @api private
 */

function nulls(val) {
  return val != null && val !== '';
}

/**
 * join array as classes.
 *
 * @param {*} val
 * @return {String}
 */
exports.joinClasses = joinClasses;
function joinClasses(val) {
  return Array.isArray(val) ? val.map(joinClasses).filter(nulls).join(' ') : val;
}

/**
 * Render the given classes.
 *
 * @param {Array} classes
 * @param {Array.<Boolean>} escaped
 * @return {String}
 */
exports.cls = function cls(classes, escaped) {
  var buf = [];
  for (var i = 0; i < classes.length; i++) {
    if (escaped && escaped[i]) {
      buf.push(exports.escape(joinClasses([classes[i]])));
    } else {
      buf.push(joinClasses(classes[i]));
    }
  }
  var text = joinClasses(buf);
  if (text.length) {
    return ' class="' + text + '"';
  } else {
    return '';
  }
};

/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = function attr(key, val, escaped, terse) {
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
  } else if (escaped) {
    return ' ' + key + '="' + exports.escape(val) + '"';
  } else {
    return ' ' + key + '="' + val + '"';
  }
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 */
exports.attrs = function attrs(obj, terse){
  var buf = [];

  var keys = Object.keys(obj);

  if (keys.length) {
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('class' == key) {
        if (val = joinClasses(val)) {
          buf.push(' ' + key + '="' + val + '"');
        }
      } else {
        buf.push(exports.attr(key, val, false, terse));
      }
    }
  }

  return buf.join('');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function escape(html){
  var result = String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  if (result === '' + html) return html;
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = function rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str = str || require('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};

},{"fs":3}],5:[function(require,module,exports){
//     Underscore.js 1.7.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.7.0';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var createCallback = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  _.iteratee = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return createCallback(value, context, argCount);
    if (_.isObject(value)) return _.matches(value);
    return _.property(value);
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    if (obj == null) return obj;
    iteratee = createCallback(iteratee, context);
    var i, length = obj.length;
    if (length === +length) {
      for (i = 0; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    if (obj == null) return [];
    iteratee = _.iteratee(iteratee, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length),
        currentKey;
    for (var index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index = 0, currentKey;
    if (arguments.length < 3) {
      if (!length) throw new TypeError(reduceError);
      memo = obj[keys ? keys[index++] : index++];
    }
    for (; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== + obj.length && _.keys(obj),
        index = (keys || obj).length,
        currentKey;
    if (arguments.length < 3) {
      if (!index) throw new TypeError(reduceError);
      memo = obj[keys ? keys[--index] : --index];
    }
    while (index--) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    predicate = _.iteratee(predicate, context);
    _.some(obj, function(value, index, list) {
      if (predicate(value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    predicate = _.iteratee(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(_.iteratee(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    if (obj == null) return true;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    if (obj == null) return false;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (obj.length !== +obj.length) obj = _.values(obj);
    return _.indexOf(obj, target) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = obj && obj.length === +obj.length ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = low + high >>> 1;
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return obj.length === +obj.length ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = _.iteratee(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    for (var i = 0, length = input.length; i < length; i++) {
      var value = input[i];
      if (!_.isArray(value) && !_.isArguments(value)) {
        if (!strict) output.push(value);
      } else if (shallow) {
        push.apply(output, value);
      } else {
        flatten(value, shallow, strict, output);
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (array == null) return [];
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = _.iteratee(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i];
      if (isSorted) {
        if (!i || seen !== value) result.push(value);
        seen = value;
      } else if (iteratee) {
        var computed = iteratee(value, i, array);
        if (_.indexOf(seen, computed) < 0) {
          seen.push(computed);
          result.push(value);
        }
      } else if (_.indexOf(result, value) < 0) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    if (array == null) return [];
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = array.length; i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, true, []);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function(array) {
    if (array == null) return [];
    var length = _.max(arguments, 'length').length;
    var results = Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var idx = array.length;
    if (typeof from == 'number') {
      idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
    }
    while (--idx >= 0) if (array[idx] === item) return idx;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var Ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    args = slice.call(arguments, 2);
    bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      Ctor.prototype = func.prototype;
      var self = new Ctor;
      Ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (_.isObject(result)) return result;
      return self;
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = hasher ? hasher.apply(this, arguments) : key;
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last > 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed before being called N times.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      } else {
        func = null;
      }
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    if (!_.isObject(obj)) return obj;
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
        }
      }
    }
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj, iteratee, context) {
    var result = {}, key;
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      iteratee = createCallback(iteratee, context);
      for (key in obj) {
        var value = obj[key];
        if (iteratee(value, key, obj)) result[key] = value;
      }
    } else {
      var keys = concat.apply([], slice.call(arguments, 1));
      obj = new Object(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        key = keys[i];
        if (key in obj) result[key] = obj[key];
      }
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(concat.apply([], slice.call(arguments, 1)), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    if (!_.isObject(obj)) return obj;
    for (var i = 1, length = arguments.length; i < length; i++) {
      var source = arguments[i];
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    }
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (
      aCtor !== bCtor &&
      // Handle Object.create(x) cases
      'constructor' in a && 'constructor' in b &&
      !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
        _.isFunction(bCtor) && bCtor instanceof bCtor)
    ) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size, result;
    // Recursively compare objects and arrays.
    if (className === '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size === b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      size = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      result = _.keys(b).length === size;
      if (result) {
        while (size--) {
          // Deep compare each member
          key = keys[size];
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around an IE 11 bug.
  if (typeof /./ !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    var pairs = _.pairs(attrs), length = pairs.length;
    return function(obj) {
      if (obj == null) return !length;
      obj = new Object(obj);
      for (var i = 0; i < length; i++) {
        var pair = pairs[i], key = pair[0];
        if (pair[1] !== obj[key] || !(key in obj)) return false;
      }
      return true;
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = createCallback(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? object[property]() : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],6:[function(require,module,exports){
var Collection = require('backbone').Collection;
var Combination = require('../models/combination');

var CombinationCollection = Collection.extend({
	model: Combination,
	initialize: function(data) {
		this.originalModels = data;
	},

	findByIngredient: function(query) {
		this.reset(this.originalModels);
		var filtered = this.filter(function(item) {
			return item.get('input_1').toLowerCase().indexOf(query.toLowerCase()) > -1 || item.get('input_2').toLowerCase().indexOf(query.toLowerCase()) > -1 || item.get('output').toLowerCase().indexOf(query.toLowerCase()) > -1;
		});
		this.reset(filtered);
	}
});
module.exports = CombinationCollection;
},{"../models/combination":8,"backbone":2}],7:[function(require,module,exports){
module.exports=[{
	"output_category": "Armor",
	"input_1": "Anvil",
	"input_2": "Cloth Scraps",
	"output": "Homemade Cloth Boots",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor",
	"input_1": "Weresheep Wool",
	"input_2": "Elemental Forge",
	"output": "Weresheep Armor",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "Produces 4 pieces",
	"source": ["Weresheep Recipe"]
}, {
	"output_category": "Armor",
	"input_1": "Anvil",
	"input_2": "Cloth Scraps",
	"output": "Homemade Cloth Boots",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor",
	"input_1": "Anvil",
	"input_2": "Cloth Scraps",
	"output": "Homemade Cloth Boots",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Sm. Def+, Sm. Movement+",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor",
	"input_1": "Anvil",
	"input_2": "Leather Scraps",
	"output": "Homemade Leather Boots",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor",
	"input_1": "Anvil",
	"input_2": "Leather Scraps",
	"output": "Homemade Leather Boots",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor",
	"input_1": "Anvil",
	"input_2": "Leather Scraps",
	"output": "Homemade Leather Boots",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor",
	"input_1": "Anvil",
	"input_2": "Leather Scraps",
	"output": "Homemade Leather Boots",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "Sm. Def+, Sm. Movement+",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor",
	"input_1": "Anvil",
	"input_2": "Metal Scraps",
	"output": "Homemade Metal Boots",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor",
	"input_1": "Anvil",
	"input_2": "Metal Scraps",
	"output": "Homemade Metal Boots",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor",
	"input_1": "Anvil",
	"input_2": "Metal Scraps",
	"output": "Homemade Metal Boots",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "Sm. Def+, Sm. Movement+",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor",
	"input_1": "Needle & Thread",
	"input_2": "Cloth Scraps",
	"output": "Homemade Cloth Chest Armor",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XVI"]
}, {
	"output_category": "Armor",
	"input_1": "Needle & Thread",
	"input_2": "Cloth Scraps",
	"output": "Homemade Cloth Chest Armor",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XVI"]
}, {
	"output_category": "Armor",
	"input_1": "Needle & Thread",
	"input_2": "Cloth Scraps",
	"output": "Homemade Cloth Chest Armor",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XVI"]
}, {
	"output_category": "Armor",
	"input_1": "Needle & Thread",
	"input_2": "Cloth Scraps",
	"output": "Homemade Cloth Chest Armor",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XVI"]
}, {
	"output_category": "Armor",
	"input_1": "Needle & Thread",
	"input_2": "Cloth Scraps",
	"output": "Homemade Cloth Chest Armor",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "Armor Rating, HP, or Lucky Charm bonus.",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XVI"]
}, {
	"output_category": "Armor",
	"input_1": "Needle & Thread (Magic)",
	"input_2": "Cloth Scraps",
	"output": "Homemade Robe",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "HP, Intelligence, Lucky Charm, or Speed bonus",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XVI"]
}, {
	"output_category": "Armor",
	"input_1": "Needle & Thread",
	"input_2": "Leather Scraps",
	"output": "Homemade Leather Chest Armor",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XVI"]
}, {
	"output_category": "Armor",
	"input_1": "Needle & Thread",
	"input_2": "Leather Scraps",
	"output": "Homemade Leather Chest Armor",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XVI"]
}, {
	"output_category": "Armor",
	"input_1": "Needle & Thread",
	"input_2": "Leather Scraps",
	"output": "Homemade Leather Chest Armor",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XVI"]
}, {
	"output_category": "Armor",
	"input_1": "Needle & Thread (Magic)",
	"input_2": "Leather Scraps",
	"output": "Homemade Leather Chest Armor",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "Sm VIT+, Sm LCK+, Sm. Armor+",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XVI"]
}, {
	"output_category": "Armor",
	"input_1": "Hammer",
	"input_2": "Metal Scraps",
	"output": "Homemade Metal Armor",
	"skill": "Blacksmithing",
	"skill_level": 3,
	"bonus": "Character Level 5: Armor Rating, HP or Lucky Charm bonus",
	"notes": "Leveled to player. ",
	"source": []
}, {
	"output_category": "Armor",
	"input_1": "Hammer",
	"input_2": "Metal Scraps",
	"output": "Homemade Metal Armor",
	"skill": "Blacksmithing",
	"skill_level": 4,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor",
	"input_1": "Hammer",
	"input_2": "Metal Scraps",
	"output": "Homemade Metal Armor",
	"skill": "Blacksmithing",
	"skill_level": 5,
	"bonus": "Sm VIT+, Sm LCK+, Sm. Armor+",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor",
	"input_1": "Needle & Thread",
	"input_2": "Pixie Dust",
	"output": "Magic Needle & Thread",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Armor",
	"input_1": "Hair",
	"input_2": "Hair",
	"output": "Thread",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": ["The Adventurer's Field Guide XIX"]
}, {
	"output_category": "Armor",
	"input_1": "Thread",
	"input_2": "Needle",
	"output": "Needle & Thread",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Armor",
	"input_1": "Wool",
	"input_2": "Wool",
	"output": "Yarn",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Armor",
	"input_1": "Shears",
	"input_2": "Sheep",
	"output": "Wool",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "You can speak to sheep with the shears in your inventory if you have Pet Pal. ",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Sack of Barley",
	"input_2": "Mill",
	"output": "Grist",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "The book can be found in Glen's house, it is part of the quest 'Distill My Heart'",
	"source": ["The Art of Whiskey"]
}, {
	"output_category": "Food",
	"input_1": "Wort",
	"input_2": "Pot Still",
	"output": "Spirit",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "You can get wort by using a bucket with water on grist. This is for the quest 'Distill My Heart'. ",
	"source": ["The Art of Whiskey"]
}, {
	"output_category": "Food",
	"input_1": "Grist",
	"input_2": "Bucket of Water",
	"output": "Wort",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "Used for the quest Distill My Heart. ",
	"source": ["The Art of Whiskey"]
}, {
	"output_category": "Armor",
	"input_1": "Yarn",
	"input_2": "Yarn",
	"output": "Rope",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": ["The Adventurer's Field Guide XVII"]
}, {
	"output_category": "Armor",
	"input_1": "Rope",
	"input_2": "Barrel Lid",
	"output": "Homemade Shield",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Barrel lids cannot be aquired without a mod.",
	"source": []
}, {
	"output_category": "Armor",
	"input_1": "Rope",
	"input_2": "Barrel Lid",
	"output": "Homemade Shield",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Barrel lids cannot be aquired without a mod.",
	"source": []
}, {
	"output_category": "Armor",
	"input_1": "Rope",
	"input_2": "Barrel Lid",
	"output": "Homemade Shield",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "Barrel lids cannot be aquired without a mod.",
	"source": []
}, {
	"output_category": "Armor",
	"input_1": "Nine Inch Nails",
	"input_2": "Any Shoes",
	"output": "Snowshoes",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "These allow you to be immune to slipping",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Rabbit Foot",
	"input_2": "Pixie Dust",
	"output": "Magic Rabbit Foot",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Rabbit Foot",
	"input_2": "Thread",
	"output": "Amulet (Rabbit Foot)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Rabbit Foot",
	"input_2": "Bowstring",
	"output": "Super Amulet (Rabbit Foot)",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Rabbit Foot",
	"input_2": "Rope",
	"output": "Belt (Rabbit Foot)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Lucky Charm: +1",
	"notes": "Leveled to player",
	"source": ["Secrets of the Scroll III"]
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Rabbit Foot",
	"input_2": "Jeweller's Ring Kit",
	"output": "Ring (Rabbit Foot)",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Super Amulet (Rabbit Foot)",
	"input_2": "Jeweller's Ring Kit",
	"output": "Super Ring (Rabbit Foot)",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Leveled to player.  Unclear how one is to get a Super Amulet at Crafting Level 2 when the Super Amulet requires Level 3",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Rabbit Foot - Lucky",
	"input_2": "Pixie Dust",
	"output": "Magic Rabbit Foot - Lucky",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Rabbit Foot - Lucky",
	"input_2": "Thread",
	"output": "Amulet (Rabbit Foot - Lucky)",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "Lucky Charm: +1, +Movement",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XIX"]
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Rabbit Foot - Lucky",
	"input_2": "Bowstring",
	"output": "Super Amulet (Rabbit Foot - Lucky)",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Lucky Charm: +1, +Movement",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Rabbit Foot - Lucky",
	"input_2": "Jeweller's Ring Kit",
	"output": "Ring (Rabbit Foot - Lucky)",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Super Amulet (Rabbit Foot - Lucky)",
	"input_2": "Rope",
	"output": "Super Belt (Rabbit Foot - Lucky)",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Super Amulet (Rabbit Foot - Lucky)",
	"input_2": "Jeweller's Ring Kit",
	"output": "Super Ring (Rabbit Foot - Lucky)",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Leveled to player.  Unclear how one is to get a Super Amulet at Crafting Level 2 when the Super Amulet requires Level 3",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Antler",
	"input_2": "Pixie Dust",
	"output": "Magic Antler",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Antler",
	"input_2": "Any Leather Helmet",
	"output": "Antler Helmet",
	"skill": "",
	"skill_level": null,
	"bonus": "(IL=HL. Constitution: +1(HL1) / +2(HL17). Water Resistance: +5%(HL1) / +10%(HL6) / +15%(HL11) / +20%(HL16) / +25%(HL21))",
	"notes": "",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Chicken Foot",
	"input_2": "Pixie Dust",
	"output": "Magic Chicken Foot",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player. There is a bug where it's called 'Chicken Foot'",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Chicken Foot",
	"input_2": "Thread",
	"output": "Amulet (Chicken Foot)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Initiative +1",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XIX"]
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Chicken Foot",
	"input_2": "Rope",
	"output": "Belt (Chicken Foot)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Initiative +1",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XIX"]
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Chicken Foot",
	"input_2": "Jeweller's Ring Kit",
	"output": "Ring (Chicken Foot)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Chicken Foot - Big",
	"input_2": "Pixie Dust",
	"output": "Magic Chicken Foot",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Bug.  This prevents the crafting of Amulet & Ring for Big Chicken Foot.  Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Chicken Foot - Big",
	"input_2": "Thread",
	"output": "Amulet (Chicken Foot - Big)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Chicken Foot - Big",
	"input_2": "Jeweller's Ring Kit",
	"output": "Ring (Chicken Foot)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Bug?  Should this be a version for Big Chicken Foot?  It exists in the Armor files.  Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Claw",
	"input_2": "Pixie Dust",
	"output": "Magic Claw",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Claw",
	"input_2": "Thread",
	"output": "Amulet (Claw)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Strength: +1 (HL1) / +2 (HL17)",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XIX"]
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Claw",
	"input_2": "Rope",
	"output": "Belt (Claw)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Claw",
	"input_2": "Jeweller's Ring Kit",
	"output": "Ring (Claw)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Claw - Sharp",
	"input_2": "Pixie Dust",
	"output": "Magic Claw",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Bug.  This prevents the crafting of Amulet & Ring for Sharp Claw.  Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Claw - Sharp",
	"input_2": "Thread",
	"output": "Amulet (Claw - Sharp)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Claw - Sharp",
	"input_2": "Rope",
	"output": "Belt (Claw - Sharp)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Claw - Sharp",
	"input_2": "Jeweller's Ring Kit",
	"output": "Ring (Claw - Sharp)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Crab Claw",
	"input_2": "Any Leather Helmet",
	"output": "Helmet (Crab Claw)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "+HP bonus",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Eye",
	"input_2": "Pixie Dust",
	"output": "Magic Eye",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Eye",
	"input_2": "Thread",
	"output": "Amulet (Eye)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Eye",
	"input_2": "Any Leather Helmet",
	"output": "Helmet (Eye)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Eye - Creepy",
	"input_2": "Pixie Dust",
	"output": "Magic Eye - Creepy",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Eye - Creepy",
	"input_2": "Thread",
	"output": "Amulet (Eye - Creepy)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Perception: +1 (HL1) / +2 (HL17), + Sight",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XIX"]
}, {
	"output_category": "Armor - Magic",
	"input_1": "Eye - Creepy",
	"input_2": "Any Leather Helmet",
	"output": "Helmet (Eye - Creepy)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Feather",
	"input_2": "Pixie Dust",
	"output": "Magic Feather",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Feather",
	"input_2": "Thread",
	"output": "Amulet (Feather)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Dexterity: +1 (HL1) / +2 (HL17)",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XIX"]
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Feather",
	"input_2": "Rope",
	"output": "Belt (Feather)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Feather",
	"input_2": "Jeweller's Ring Kit",
	"output": "Ring (Feather)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Feather",
	"input_2": "Any Leather Helmet",
	"output": "Helmet (Feather)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Feather - Fancy",
	"input_2": "Pixie Dust",
	"output": "Magic Feather - Fancy",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Feather - Fancy",
	"input_2": "Thread",
	"output": "Amulet (Feather - Fancy)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Dexterity: +1 (HL1) / +2 (HL17), + HP",
	"notes": "Leveled to player",
	"source": ["(The Adventurer's Field Guide XIX"]
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Feather - Fancy",
	"input_2": "Jeweller's Ring Kit",
	"output": "Ring (Feather - Fancy)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Feather - Fancy",
	"input_2": "Any Leather Helmet",
	"output": "Helmet (Feather - Fancy)",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "Sneaking: +1. Air Resistance: +5%(HL1) / +10%(HL6) / +15%(HL11) / +20%(HL16) / +25%(HL21)",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Rat Tail",
	"input_2": "Pixie Dust",
	"output": "Magic Rat Tail",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Rat Tail",
	"input_2": "Thread",
	"output": "Amulet (Rat Tail)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Poison Resistance: +5%(HL1) / +10%(HL6) / +15%(HL11) / +20%(HL16) / +25%(HL21)",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XIX"]
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Rat Tail",
	"input_2": "Rope",
	"output": "Belt (Rat Tail)",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "Poison Resistance: +5%(HL1) / +10%(HL6) / +15%(HL11) / +20%(HL16) / +25%(HL21)",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Rat Tail",
	"input_2": "Jeweller's Ring Kit",
	"output": "Ring (Rat Tail)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Rat Tail - Long",
	"input_2": "Pixie Dust",
	"output": "Magic Rat Tail - Long",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Rat Tail - Long",
	"input_2": "Thread",
	"output": "Amulet (Rat Tail - Long)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Poison Resistance: +5%(HL1) / +10%(HL4) / +15%(HL9) / +20%(HL14) / +25%(HL19)",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XIX"]
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Rat Tail - Long",
	"input_2": "Jeweller's Ring Kit",
	"output": "Ring (Rat Tail - Long)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Skull",
	"input_2": "Thread",
	"output": "Amulet (Skull)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Skull",
	"input_2": "Rope",
	"output": "Belt (Skull)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Constitution: +1 (HL1) / +2 (HL17)",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Skull",
	"input_2": "Jeweller's Ring Kit",
	"output": "Ring (Skull)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Skull",
	"input_2": "Pixie Dust",
	"output": "Magic Skull",
	"skill": "Crafting",
	"skill_level": null,
	"bonus": "",
	"notes": "Ancient Human Skull gives a better variant",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Skull - Ancient",
	"input_2": "Thread",
	"output": "Amulet (Skull - Ancient)",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Intelligence: +1(HL1) / +2 HL17), Earth Resistance: +5%(HL1) / +10%(HL6) / +15%(HL11) / +20%(HL16) / +25%(HL21)",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XIX"]
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Skull - Ancient",
	"input_2": "Jeweller's Ring Kit",
	"output": "Ring (Skull - Ancient)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Constitution: +1(HL1) / +2 HL17), Earth Resistance: +5%(HL1) / +10%(HL6) / +15%(HL11) / +20%(HL16) / +25%(HL21)",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Skull - Tattooed",
	"input_2": "Thread",
	"output": "Amulet (Skull - Tattooed)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Skull - Tattooed",
	"input_2": "Jeweller's Ring Kit",
	"output": "Ring (Skull - Tattooed)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Starfish",
	"input_2": "Pixie Dust",
	"output": "Magic Starfish",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Starfish",
	"input_2": "Thread",
	"output": "Amulet (Starfish)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Starfish",
	"input_2": "Any Leather Helmet",
	"output": "Helmet (Starfish)",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "Leadership: +1. Water Resistance: +5%(HL1) / +10%(HL6) / +15%(HL11) / +20%(HL16) / +25%(HL21)",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Starfish - Glowing",
	"input_2": "Pixie Dust",
	"output": "Magic Starfish - Glowing",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "+HP, Water Resistance: +5%(HL1) / +10%(HL6) / +15%(HL11) / +20%(HL16) / +25%(HL21)",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XIX"]
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Starfish - Glowing",
	"input_2": "Thread",
	"output": "Amulet (Starfish - Glowing)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Starfish - Glowing",
	"input_2": "Any Leather Helmet",
	"output": "Helmet (Starfish - Glowing)",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "Leadership: +1. Water Resistance: +5%(HL1) / +10%(HL4) / +15%(HL9) / +20%(HL14) / +25%(HL19)",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Tooth",
	"input_2": "Pixie Dust",
	"output": "Magic Tooth",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Tooth",
	"input_2": "Thread",
	"output": "Amulet (Tooth)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Tooth",
	"input_2": "Rope",
	"output": "Belt (Tooth)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Charisma: +1",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Tooth",
	"input_2": "Rope",
	"output": "Belt (Tooth - Sharp)",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "Charisma: +1. Fire Resistance: + 5%(HL1) / +10%(HL6) / +15%(HL11) / +20%(HL16) / +25%(HL21)",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Tooth",
	"input_2": "Jeweller's Ring Kit",
	"output": "Ring (Tooth)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Tooth - Sharp",
	"input_2": "Pixie Dust",
	"output": "Magic Tooth - Sharp",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Tooth - Sharp",
	"input_2": "Thread",
	"output": "Amulet (Tooth - Sharp)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Charisma: +1",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XIX"]
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Tooth - Sharp",
	"input_2": "Jeweller's Ring Kit",
	"output": "Ring (Tooth - Sharp)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Tusk",
	"input_2": "Pixie Dust",
	"output": "Magic Tusk",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player. Bug: Magic Tusk is called Magic Tooth. ",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Tusk",
	"input_2": "Thread",
	"output": "Amulet (Tusk)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Loremaster: +1",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XIX"]
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Tusk",
	"input_2": "Rope",
	"output": "Belt (Tusk)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Body Building: +1",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Tusk",
	"input_2": "Jeweller's Ring Kit",
	"output": "Ring (Tusk)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Tusk - Large",
	"input_2": "Pixie Dust",
	"output": "Magic Tusk - Large",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Loremaster: +1. Intelligence: +1(HL1) / +2(HL17). Air Resistance: +5%(HL1) / +10%(HL6) / +15%(HL11) / +20%(HL16) / +25%(HL21)",
	"notes": "Leveled to player",
	"source": ["The Adventurer's Field Guide XIX"]
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Tusk - Large",
	"input_2": "Thread",
	"output": "Amulet (Tusk - Large)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Armor - Magic",
	"input_1": "Magic Tusk - Large",
	"input_2": "Jeweller's Ring Kit",
	"output": "Ring (Tusk - Large)",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Cup of Oil",
	"input_2": "Arrowhead",
	"output": "Slowdown Arrowhead, Empty Cup",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Same as using a barrel of oil",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Cup of Oil",
	"input_2": "Fire Arrowhead",
	"output": "Explosive Arrowhead, Empty Cup",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Same as using a barrel of oil",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Barrel of Oil",
	"input_2": "Arrowhead",
	"output": "Slowdown Arrowhead",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Same as using a cup of oil.  Cup of oil = Barrel of Oil + Empty cup",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Barrel of Oil",
	"input_2": "Fire Arrowhead",
	"output": "Explosive Arrowhead",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Same as using a cup of oil.  Cup of oil = Barrel of Oil + Empty cup",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Cup of Water",
	"input_2": "Fire Arrowhead",
	"output": "Steam Arrowhead, Empty Cup",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Does not work with Mug of Water, Bottle of Water, or Bucket of Water",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Cup of Water",
	"input_2": "Stunning Arrowhead",
	"output": "Static Cloud Arrowhead, Empty Cup",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Stunning arrowheads can be made from Antler.  Does not work with Mug of Water, Bottle of Water, or Bucket of Water",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Barrel of Ooze",
	"input_2": "Arrowhead",
	"output": "Poison Arrowhead",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Ooze cannot be put into a cup :(",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Drudanae Herb",
	"input_2": "Arrowhead",
	"output": "Charming Arrowhead",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Fire Resistance Potion",
	"input_2": "Arrowhead",
	"output": "Explosive Arrowhead",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "I want a mod to return an empty potion bottle as well",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Water Resistance Potion",
	"input_2": "Arrowhead",
	"output": "Steam Arrowhead",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "I want a mod to return an empty potion bottle as well",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Air Resistance Potion",
	"input_2": "Arrowhead",
	"output": "Static Cloud Arrowhead",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "I want a mod to return an empty potion bottle as well",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Poison Arrowhead",
	"input_2": "Poison Arrowhead",
	"output": "Poison Cloud Arrowhead",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Poison Potion",
	"input_2": "Arrowhead",
	"output": "Poison Arrowhead",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Medium Poison Potion",
	"input_2": "Arrowhead",
	"output": "Poison Arrowhead",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "No different from Small Poison Potion",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Large Poison Potion",
	"input_2": "Arrowhead",
	"output": "Poison Arrowhead",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "No different from Small Poison Potion",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Rotten Eggs",
	"input_2": "Arrowhead",
	"output": "Poison Arrowhead",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Strength Debuff Potion",
	"input_2": "Arrowhead",
	"output": "Strength Debuff Arrowhead",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Dexterity Debuff Potion",
	"input_2": "Arrowhead",
	"output": "Dexterity Debuff Arrowhead",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Intelligence Debuff Potion",
	"input_2": "Arrowhead",
	"output": "Intelligence Debuff Arrowhead",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Constitution Debuff Potion",
	"input_2": "Arrowhead",
	"output": "Constitution Debuff Arrowhead",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Speed Debuff Potion",
	"input_2": "Arrowhead",
	"output": "Speed Debuff Arrowhead",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Perception Debuff Potion",
	"input_2": "Arrowhead",
	"output": "Perception Debuff Arrowhead",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Debuff All Potion",
	"input_2": "Arrowhead",
	"output": "Debuff All Arrowhead",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Any Arrowhead",
	"input_2": "Shaft",
	"output": "Arrow matching the arrowhead",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "Arrowhead (plain)",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Arrow Shaft",
	"input_2": "Arrowhead",
	"output": "Arrow",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "This is useless",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Any Arrowhead",
	"input_2": "Shaft",
	"output": "Arrow matching the arrowhead",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "KO Arrowhead, Stunning Arrowhead, SlowDown Arrowhead, SmokeScreen Arrowhead, Fire Arrowhead",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Any Arrowhead",
	"input_2": "Shaft",
	"output": "Arrow matching the arrowhead",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Silver Arrowhead, Steam Cloud Arrowhead, Poison Arrowhead",
	"source": []
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 2,
	"output": " Arrow of Ignorance",
	"input_1": " Debuff Intelligence Potion ",
	"input_2": " Arrowhead ",
	"source": ["The String Enthusiast II "],
	"bonus": "Lowers target's Intelligence"
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 2,
	"output": " Blinding Arrow",
	"input_1": " Debuff Perception Potion ",
	"input_2": " Arrowhead ",
	"source": ["The String Enthusiast II "],
	"bonus": "Lowers target's Perception"
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 4,
	"output": " Charming Arrow",
	"input_1": " Charming Arrowhead ",
	"input_2": " Arrow Shaft ",
	"source": [],
	"bonus": "Charms target"
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 4,
	"output": " Charming Arrowhead",
	"input_1": " Drudanae ",
	"input_2": " Arrowhead",
	"source": [],
	"bonus": ""
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 3,
	"output": " Cursing Arrow",
	"input_1": " Debuff-All Potion ",
	"input_2": " Arrowhead ",
	"source": ["The String Enthusiast II "],
	"bonus": "Lowers all of target's Primary Stats"
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 3,
	"output": " Explosive Arrow",
	"input_1": " Explosive Arrowhead ",
	"input_2": " Arrow Shaft ",
	"source": [],
	"bonus": "Creates an explosion"
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 2,
	"output": "Explosive Arrowhead ",
	"input_1": "Cup of Oil",
	"input_2": "Fire Arrowhead ",
	"source": [],
	"bonus": ""
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 3,
	"output": " Explosive Arrowhead",
	"input_1": " Fire Resistance Potion ",
	"input_2": " Arrowhead ",
	"source": ["The String Enthusiast II"],
	"bonus": ""
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 1,
	"output": " Fire Arrow",
	"input_1": " Fire Arrowhead ",
	"input_2": " Arrow Shaft ",
	"source": [],
	"bonus": "Can Burn target"
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 3,
	"output": " Freezing Arrow",
	"input_1": " Freezing Arrowhead ",
	"input_2": " Arrow Shaft ",
	"source": [],
	"bonus": "Can Freeze target"
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 1,
	"output": " Knockdown Arrow",
	"input_1": " Knockdown Arrowhead ",
	"input_2": " Arrow Shaft ",
	"source": [],
	"bonus": "Can knock down target"
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 1,
	"output": " Knockdown Arrowhead",
	"input_1": " Antler ",
	"input_2": " Knife or Dagger",
	"source": [],
	"bonus": ""
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 2,
	"output": " Poison Arrow",
	"input_1": " Poisoned Arrowhead ",
	"input_2": " Arrow Shaft ",
	"source": [],
	"bonus": "Can poison target"
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 2,
	"output": " Poisoned Arrowhead",
	"input_1": " Intestines ",
	"input_2": " Arrowhead",
	"source": [],
	"bonus": ""
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 2,
	"output": " Poisoned Arrowhead",
	"input_1": " Poison Flask ",
	"input_2": " Arrowhead ",
	"source": ["The String Enthusiast III"],
	"bonus": ""
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 2,
	"output": " Poisoned Arrowhead",
	"input_1": " Rotten Eggs ",
	"input_2": " Arrowhead",
	"source": [],
	"bonus": ""
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 2,
	"output": " Poisoned Arrowhead",
	"input_1": " Arrowhead ",
	"input_2": " Ooze Barrel ",
	"source": ["The Adventurer's Field Guide X"],
	"bonus": ""
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 3,
	"output": " Poisoncloud Arrow",
	"input_1": " Poisoncloud Arrowhead ",
	"input_2": " Arrow Shaft ",
	"source": [],
	"bonus": "Creates Poison Cloud"
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 3,
	"output": " Poisoncloud Arrowhead",
	"input_1": " Poisoned Arrowhead ",
	"input_2": " Poisoned Arrowhead",
	"source": [],
	"bonus": ""
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 2,
	"output": " Silver Arrow",
	"input_1": " Silver Arrowhead ",
	"input_2": " Arrow Shaft ",
	"source": [],
	"bonus": "Breaks Armor"
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 2,
	"output": " Silver Arrowhead ",
	"input_1": "Silver Bar",
	"input_2": "Anvil",
	"source": [],
	"bonus": ""
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 2,
	"output": " Slowdown Arrow",
	"input_1": " Slowdown Arrowhead ",
	"input_2": " Arrow Shaft ",
	"source": [],
	"bonus": "Slows down target"
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 2,
	"output": " Slowdown Arrowhead ",
	"input_1": " Cup of Oil ",
	"input_2": " Arrowhead",
	"source": [],
	"bonus": ""
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 2,
	"output": " Slowdown Arrowhead",
	"input_1": " Arrowhead ",
	"input_2": " Oil Barrel",
	"source": [],
	"bonus": ""
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 2,
	"output": " Slowness Arrow",
	"input_1": " Debuff Speed Potion ",
	"input_2": " Arrowhead ",
	"source": ["The String Enthusiast II "],
	"bonus": "Lowers target's Speed"
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 1,
	"output": " Smokscreen Arrow",
	"input_1": " Smokscreen Arrowhead ",
	"input_2": " Arrow Shaft ",
	"source": [],
	"bonus": "Creates a Smokescreen"
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 3,
	"output": " Static Cloud Arrow",
	"input_1": " Static Cloud Arrowhead ",
	"input_2": " Arrow Shaft ",
	"source": [],
	"bonus": "Creates a Static Cloud"
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 2,
	"output": " Static Cloud Arrowhead ",
	"input_1": " Cup of Water",
	"input_2": " Stunning Arrowhead ",
	"source": [],
	"bonus": ""
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 3,
	"output": " Static Cloud Arrowhead",
	"input_1": " Air Resistance Potion ",
	"input_2": " Arrowhead ",
	"source": ["The String Enthusiast II"],
	"bonus": ""
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 2,
	"output": " Steamcloud Arrow",
	"input_1": " Steamcloud Arrowhead ",
	"input_2": " Arrow Shaft ",
	"source": [],
	"bonus": "Creates a Steam Cloud"
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 2,
	"output": " Steamcloud Arrowhead ",
	"input_1": " Cup of Water",
	"input_2": " Fire Arrowhead ",
	"source": [],
	"bonus": ""
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 2,
	"output": " Steamcloud Arrowhead",
	"input_1": " Water Resistance Potion ",
	"input_2": " Arrowhead ",
	"source": ["The String Enthusiast II"],
	"bonus": ""
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 1,
	"output": " Stunning Arrow",
	"input_1": " Stunning Arrowhead ",
	"input_2": " Arrow Shaft ",
	"source": [],
	"bonus": ""
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 1,
	"output": " Stunning Arrowhead",
	"input_1": " Tooth ",
	"input_2": " Knife or Dagger",
	"source": [],
	"bonus": "Stuns target"
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 2,
	"output": " Weakening Arrow",
	"input_1": " Debuff Strength Potion ",
	"input_2": " Arrowhead ",
	"source": ["The String Enthusiast II "],
	"bonus": "Lowers target's Strength"
}, {
	"skill": "Crafting",
	"output_category": "Arrow",
	"skill_level": 2,
	"output": " Withering Arrow",
	"input_1": " Debuff Constitution Potion ",
	"input_2": " Arrowhead ",
	"source": ["The String Enthusiast II "],
	"bonus": "Lowers target's Constitution"
}, {
	"output_category": "Arrow",
	"input_1": "Any Arrowhead",
	"input_2": "Shaft",
	"output": "Arrow matching the arrowhead",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "Explosive Arrowhead, Poison Cloud Arrowhead, Static Cloud Arrowhead, Freezing Arrowhead",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Any Arrowhead",
	"input_2": "Shaft",
	"output": "Arrow matching the arrowhead",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "Charming Arrowhead",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Anvil",
	"input_2": "Silver Bar",
	"output": "Silver Arrowhead x4",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Knife / Dagger",
	"input_2": "Tooth",
	"output": "Stunning Arrowhead",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Knife / Dagger",
	"input_2": "Antler",
	"output": "Knockdown Arrowhead",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Arrow",
	"input_1": "Knife / Dagger",
	"input_2": "Branch",
	"output": "Arrowshaft",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": ["Crafting and Cooking with Maradino"]
}, {
	"output_category": "Boost",
	"input_1": "Poison Potion",
	"input_2": "Any Weapon",
	"output": "Boosted Weapon",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Sm. Poison+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Medium Poison Potion",
	"input_2": "Any Weapon",
	"output": "Boosted Weapon",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Sm. Poison+",
	"notes": "No different from Small Poison Potion",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Large Poison Potion",
	"input_2": "Any Weapon",
	"output": "Boosted Weapon",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Sm. Poison+",
	"notes": "No different from Small Poison Potion",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Scrap Metal",
	"input_2": "Any Wooden Shield",
	"output": "Boosted Shield",
	"skill": "Blacksmithing",
	"skill_level": 2,
	"bonus": "Sm. Durability+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Scrap Metal",
	"input_2": "Any Wooden Shield",
	"output": "Boosted Shield",
	"skill": "Blacksmithing",
	"skill_level": 3,
	"bonus": "Sm. Blocking+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Scrap Metal",
	"input_2": "Any Wooden Shield",
	"output": "Boosted Shield",
	"skill": "Blacksmithing",
	"skill_level": 4,
	"bonus": "Med. Blocking+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Scrap Metal",
	"input_2": "Any Wooden Shield",
	"output": "Boosted Shield",
	"skill": "Blacksmithing",
	"skill_level": 5,
	"bonus": "Lg. Blocking+, Huge Blocking+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Pearl",
	"input_2": "Any Shield",
	"output": "Boosted Shield",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Air",
	"input_2": "Any Shield",
	"output": "Boosted Shield",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Earth",
	"input_2": "Any Shield",
	"output": "Boosted Shield",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Fire",
	"input_2": "Any Shield",
	"output": "Boosted Shield",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Water",
	"input_2": "Any Shield",
	"output": "Boosted Shield",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Void",
	"input_2": "Any Shield",
	"output": "Boosted Shield",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Anvil",
	"input_2": "Any Metal Shield",
	"output": "Boosted Shield",
	"skill": "Blacksmithing",
	"skill_level": 2,
	"bonus": "Sm. Durability+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Anvil",
	"input_2": "Any Metal Shield",
	"output": "Boosted Shield",
	"skill": "Blacksmithing",
	"skill_level": 3,
	"bonus": "Sm. Blocking+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Anvil",
	"input_2": "Any Metal Shield",
	"output": "Boosted Shield",
	"skill": "Blacksmithing",
	"skill_level": 4,
	"bonus": "Med. Blocking+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Anvil",
	"input_2": "Any Metal Shield",
	"output": "Boosted Shield",
	"skill": "Blacksmithing",
	"skill_level": 5,
	"bonus": "Lg. Blocking+, Huge Blocking+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Whetstone Wheel",
	"input_2": "Any Metal Weapon",
	"output": "Boosted Weapon",
	"skill": "Blacksmithing",
	"skill_level": 2,
	"bonus": "Sm. DMG+",
	"notes": "Sword, Axe, Spear, TwoHandedSword, TwoHandedAxe, Knife, Dagger",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Whetstone",
	"input_2": "Any Metal Weapon",
	"output": "Boosted Weapon",
	"skill": "Blacksmithing",
	"skill_level": 2,
	"bonus": "Sm. DMG+",
	"notes": "Sword, Axe, Spear, TwoHandedSword, TwoHandedAxe, Knife, Dagger",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Whetstone Wheel",
	"input_2": "Any Metal Weapon",
	"output": "Boosted Weapon",
	"skill": "Blacksmithing",
	"skill_level": 5,
	"bonus": "Med. DMG+",
	"notes": "Sword, Axe, Spear, TwoHandedSword, TwoHandedAxe",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Whetstone",
	"input_2": "Any Metal Weapon",
	"output": "Boosted Weapon",
	"skill": "Blacksmithing",
	"skill_level": 5,
	"bonus": "Med. DMG+",
	"notes": "Sword, Axe, Spear, TwoHandedSword, TwoHandedAxe",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Mobile Kitchen",
	"input_2": "Any Leather Chest Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "Sm. Def+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Anvil",
	"input_2": "Any Metal Chest Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "Sm. Move+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Holy Grail",
	"input_2": "Any Armor",
	"output": "Boosted Armor",
	"skill": "",
	"skill_level": null,
	"bonus": "Gold dye",
	"notes": "DLC only",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Homemade Bow",
	"input_2": "Bowstring",
	"output": "Boosted Weapon",
	"skill": "",
	"skill_level": 2,
	"bonus": "Sm. DMG+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Homemade Bow",
	"input_2": "Bowstring",
	"output": "Boosted Weapon",
	"skill": "",
	"skill_level": 4,
	"bonus": "Med. DMG+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Homemade Crossbow",
	"input_2": "Bowstring",
	"output": "Boosted Weapon",
	"skill": "",
	"skill_level": 3,
	"bonus": "Sm. DMG+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Homemade Crossbow",
	"input_2": "Bowstring",
	"output": "Boosted Weapon",
	"skill": "",
	"skill_level": 5,
	"bonus": "Med. DMG+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Tenebrium Bar",
	"input_2": "Any Weapon",
	"output": "Boosted Weapon",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "Tenebrium Effect",
	"notes": "Except Staff",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Joshua Spice",
	"input_2": "Any Weapon",
	"output": "Boosted Weapon",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "Lg. Fire DMG+",
	"notes": "Except Staff",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Moonstone",
	"input_2": "Staff or Club",
	"output": "Boosted Weapon",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Med. DMG+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Fire",
	"input_2": "Any Weapon",
	"output": "Boosted Weapon",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "Sm. Fire DMG+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Water",
	"input_2": "Any Weapon",
	"output": "Boosted Weapon",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "Sm. Water DMG+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Air",
	"input_2": "Any Weapon",
	"output": "Boosted Weapon",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "Sm. Air DMG+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Earth",
	"input_2": "Any Weapon",
	"output": "Boosted Weapon",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "Sm. Earth DMG+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Void",
	"input_2": "Any Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "Sm. Sneak+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Fire",
	"input_2": "Any Cloth Chest Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "Sm. Fire Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Water",
	"input_2": "Any Cloth Chest Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "Sm. Water Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Air",
	"input_2": "Any Cloth Chest Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "Sm. Air Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Earth",
	"input_2": "Any Cloth Chest Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "Sm. Earth Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Fire",
	"input_2": "Any Belt",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Sm. Fire Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Water",
	"input_2": "Any Belt",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Sm. Water Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Air",
	"input_2": "Any Belt",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Sm. Air Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Earth",
	"input_2": "Any Belt",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Sm. Earth Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Fire",
	"input_2": "Any Glove",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Sm. Fire Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Water",
	"input_2": "Any Glove",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Sm. Water Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Air",
	"input_2": "Any Glove",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Sm. Air Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Earth",
	"input_2": "Any Glove",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Sm. Earth Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Fire",
	"input_2": "Any Glove",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Sm. Fire Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Water",
	"input_2": "Any Glove",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Sm. Water Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Air",
	"input_2": "Any Glove",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Sm. Air Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Earth",
	"input_2": "Any Glove",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Sm. Earth Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Fire",
	"input_2": "Any Leather Chest Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Sm. Fire Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Water",
	"input_2": "Any Leather Chest Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Sm. Water Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Air",
	"input_2": "Any Leather Chest Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Sm. Air Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Earth",
	"input_2": "Any Leather Chest Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Sm. Earth Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Fire",
	"input_2": "Any Metal Chest Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "Sm. Fire Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Water",
	"input_2": "Any Metal Chest Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "Sm. Water Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Air",
	"input_2": "Any Metal Chest Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "Sm. Air Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Essence - Earth",
	"input_2": "Any Metal Chest Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "Sm. Earth Resist",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Leather Scraps",
	"input_2": "Any Cloth Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "Sm. Def+",
	"notes": "Chest only or also other cloth?",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Metal Scraps",
	"input_2": "Any Cloth Chest Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "Med. Def+",
	"notes": "Chest only or also other cloth?",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Metal Scraps",
	"input_2": "Any Leather Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "Med. Def+",
	"notes": "Chest only or also other leather?",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Plate Scraps",
	"input_2": "Any Metal Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "Med. Def+",
	"notes": "Chest only or also other metal armors (except Shield)",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Pearl",
	"input_2": "Any Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Gold Value+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Ruby",
	"input_2": "Any Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "Sm. Resist All+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Cup of Oil",
	"input_2": "Any Metal Armor",
	"output": "Boosted Armor",
	"skill": "",
	"skill_level": null,
	"bonus": "Sm. Movement+",
	"notes": "Chest only or also other metal armors (except Shield)",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Dye",
	"input_2": "Any Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "Armor colored to match dye",
	"notes": "Red, White, Yellow dye",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Dye",
	"input_2": "Any Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "Armor colored to match dye",
	"notes": "Green, Purple dye",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Dye",
	"input_2": "Any Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Armor colored to match dye",
	"notes": "Blue dye",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Dye",
	"input_2": "Any Armor",
	"output": "Boosted Armor",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "Armor colored to match dye",
	"notes": "Black dye",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Scope",
	"input_2": "Bow",
	"output": "Boosted Weapon",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Perception+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Scope",
	"input_2": "Crossbow",
	"output": "Boosted Weapon",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "Perception+",
	"notes": "",
	"source": []
}, {
	"output_category": "Boost",
	"input_1": "Tormented Soul",
	"input_2": "Any Weapon",
	"output": "Boosted Weapon",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "STR+, DEX+",
	"notes": "",
	"source": []
}, {
	"output_category": "Crafting Basic",
	"input_1": "Mortar & Pestle",
	"input_2": "Bone",
	"output": "Bonedust",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": ["Secredts of the Scroll I"]
}, {
	"output_category": "Crafting Basic",
	"input_1": "Mortar & Pestle",
	"input_2": "Skull",
	"output": "Bonedust",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": ["Secredts of the Scroll I"]
}, {
	"output_category": "Crafting Basic",
	"input_1": "Mortar & Pestle",
	"input_2": "Stardust Herb",
	"output": "Stardust",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": ["Secrets of the Scroll II"]
}, {
	"output_category": "Crafting Basic",
	"input_1": "Mortar & Pestle",
	"input_2": "Moonstone",
	"output": "Moondust",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": ["Secrets of the Scroll III"]
}, {
	"output_category": "Crafting Basic",
	"input_1": "Moondust",
	"input_2": "Stardust",
	"output": "Pixie Dust",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": ["Secrets of the Scroll II"]
}, {
	"output_category": "Crafting Basic",
	"input_1": "Bonedust",
	"input_2": "Stardust",
	"output": "Pixie Dust",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": ["Secrets of the Scroll II"]
}, {
	"output_category": "Crafting Basic",
	"input_1": "Barrel of Oil",
	"input_2": "Empty Cup",
	"output": "Cup of Oil",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Crafting Basic",
	"input_1": "Barrel of Oil",
	"input_2": "Empty Mug",
	"output": "Cup of Oil",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "Used for Explosive, Slowdown Arrows",
	"source": []
}, {
	"output_category": "Crafting Basic",
	"input_1": "Log",
	"input_2": "Any axe",
	"output": "Wood Chips, Branches x2",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "Branches are useful to make Staves & Arrowshafts.  Wood Chips become paper for scrolls and books.",
	"source": ["The Adventurer's Field Guide V"]
}, {
	"output_category": "Crafting Basic",
	"input_1": "Knife / Dagger",
	"input_2": "Animal Hide",
	"output": "Leather Scraps",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Used to improve cloth armor, make homemade boots, homemade leather armor, and backpacks.",
	"source": ["The Adventurer's Field Guide XX"]
}, {
	"output_category": "Crafting Basic",
	"input_1": "Knife / Dagger",
	"input_2": "Pillow",
	"output": "Feather",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Crafting Basic",
	"input_1": "Empty Bottle",
	"input_2": "Any water source",
	"output": "Bottle of Water",
	"skill": "",
	"skill_level": null,
	"bonus": "Heals: +13",
	"notes": "Wells & barrels",
	"source": []
}, {
	"output_category": "Crafting Basic",
	"input_1": "Empty Mug",
	"input_2": "Any water source",
	"output": "Mug of Water",
	"skill": "",
	"skill_level": null,
	"bonus": "Heals: +13",
	"notes": "Wells & barrels",
	"source": []
}, {
	"output_category": "Crafting Basic",
	"input_1": "Empty Cup",
	"input_2": "Any water source",
	"output": "Cup of Water",
	"skill": "",
	"skill_level": null,
	"bonus": "Heals: +13",
	"notes": "Used for Steam, Static Cloud Arrows",
	"source": []
}, {
	"output_category": "Crafting Basic",
	"input_1": "Bucket",
	"input_2": "Water Barrel",
	"output": "Bucket of Water",
	"skill": "",
	"skill_level": null,
	"bonus": "Heals: +13",
	"notes": "Wells & barrels",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Bucket of Water",
	"input_2": "Flour",
	"output": "Dough, Empty Bucket",
	"skill": "",
	"skill_level": null,
	"bonus": "Speed: -1, Heals: +7",
	"notes": "",
	"source": ["Crafting and Cooking with Maradino", "Patty Cake", "Patty Cake I"]
}, {
	"output_category": "Food",
	"input_1": "Cup of Water",
	"input_2": "Flour",
	"output": "Dough, Empty Cup",
	"skill": "",
	"skill_level": null,
	"bonus": "Speed: -1, Heals: +7",
	"notes": "",
	"source": ["Crafting and Cooking with Maradino", "Patty Cake", "Patty Cake I"]
}, {
	"output_category": "Food",
	"input_1": "Mug of Water",
	"input_2": "Flour",
	"output": "Dough, Empty Mug",
	"skill": "",
	"skill_level": null,
	"bonus": "Speed: -1, Heals: +7",
	"notes": "",
	"source": ["Crafting and Cooking with Maradino", "Patty Cake", "Patty Cake I"]
}, {
	"output_category": "Food",
	"input_1": "Bottle of Water",
	"input_2": "Flour",
	"output": "Dough, Empty Bottle",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Bottle of Water",
	"input_2": "Empty Mug",
	"output": "Mug of Water, Empty Bottle",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Bottle of Water",
	"input_2": "Empty Cup",
	"output": "Cup of Water, Empty Bottle",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Bottle of Wine",
	"input_2": "Empty Mug",
	"output": "Mug of Wine, Empty Bottle",
	"skill": "",
	"skill_level": null,
	"bonus": "Speed: -1, Heals: +32 20% chance of getting Drunk",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Bottle of Wine",
	"input_2": "Empty Cup",
	"output": "Cup of Wine, Empty Cup",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Bottle of Beer",
	"input_2": "Empty Mug",
	"output": "Mug of Beer, Empty Bottle",
	"skill": "",
	"skill_level": null,
	"bonus": "Intelligence: -1, Heals: +22 20% chance of getting Drunk",
	"notes": "There does not appear to be a matching recipe for empty cups",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Mortar & Pestle",
	"input_2": "Wheat",
	"output": "Flour",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": ["Patty Cake I", "Patty Cake II"]
}, {
	"output_category": "Food",
	"input_1": "Beer Barrel",
	"input_2": "Empty Mug",
	"output": "Mug of Beer",
	"skill": "Intelligence: -1, Heals: +22 20% chance of getting Drunk",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Beer Barrel",
	"input_2": "Empty Bottle",
	"output": "Bottle of Beer",
	"skill": "",
	"skill_level": null,
	"bonus": "Intelligence: -1, Heals: +22 20% chance of getting Drunk",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Wine Barrel",
	"input_2": "Empty Mug",
	"output": "Mug of Wine",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Wine Barrel",
	"input_2": "Empty Bottle",
	"output": "Bottle of Wine",
	"skill": "",
	"skill_level": null,
	"bonus": "Speed: -1, Heals: +32, 20% chance of getting Drunk",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Wine Barrel",
	"input_2": "Empty Cup",
	"output": "Cup of Wine",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Raw Meat",
	"input_2": "Oven / Mobile Kitchen",
	"output": "Dinner",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Fly Agaric",
	"input_2": "Any food",
	"output": "Poisoned version of food",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "No different from Minor Poison Potion",
	"source": ["Rat Extermination"]
}, {
	"output_category": "Food",
	"input_1": "Poison Potion",
	"input_2": "Any food",
	"output": "Poisoned version of food",
	"skill": "",
	"skill_level": null,
	"bonus": "100% chance to set Poisoned status",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Medium Poison Potion",
	"input_2": "Any food",
	"output": "Poisoned version of food",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "No different from Minor Poison Potion",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Large Poison Potion",
	"input_2": "Any food",
	"output": "Poisoned version of food",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "No different from Minor Poison Potion",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Ooze Barrel",
	"input_2": "Any food",
	"output": "Poisoned version of food",
	"skill": "",
	"skill_level": null,
	"bonus": "Heals: +7, Poison Resistance: +10",
	"notes": "No different from Minor Poison Potion",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Tomato",
	"input_2": "Hammer",
	"output": "Tomato Sauce",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "Repair hammer also works",
	"source": ["Crafting and Cooking with Maradino"]
}, {
	"output_category": "Food",
	"input_1": "Tomato Sauce",
	"input_2": "Dough",
	"output": "Pizza Dough",
	"skill": "",
	"skill_level": null,
	"bonus": "Speed: -1, Heals: +13",
	"notes": "",
	"source": ["Patty Cake", "Patty Cake III", "Crafting and Cooking with Maradino"]
}, {
	"output_category": "Food",
	"input_1": "Tomato Sauce",
	"input_2": "Dinner",
	"output": "Elven Stew",
	"skill": "",
	"skill_level": null,
	"bonus": "Dexterity: +1, Heals: +50",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Dough",
	"input_2": "Cheese",
	"output": "Cheese Dough",
	"skill": "",
	"skill_level": null,
	"bonus": "Speed: -1, Heals: +13",
	"notes": "",
	"source": ["Patty Cake", "Patty Cake III", "Crafting and Cooking with Maradino"]
}, {
	"output_category": "Food",
	"input_1": "Dough",
	"input_2": "Apple",
	"output": "Apple Pie Dough",
	"skill": "",
	"skill_level": null,
	"bonus": "Speed: -1, Heals: +13",
	"notes": "",
	"source": ["Patty Cake", "Patty Cake III"]
}, {
	"output_category": "Food",
	"input_1": "Dough",
	"input_2": "Any Fish",
	"output": "Fish Dough",
	"skill": "",
	"skill_level": null,
	"bonus": "Speed: -1, Heals: +13",
	"notes": "",
	"source": ["Patty Cake", "Patty Cake III", "Crafting and Cooking with Maradino"]
}, {
	"output_category": "Food",
	"input_1": "Oven / Furnace",
	"input_2": "Cheese Dough",
	"output": "Cheese Bread",
	"skill": "",
	"skill_level": null,
	"bonus": "Constitution: +1, Heals: +22",
	"notes": "",
	"source": ["Crafting and Cooking with Maradino"]
}, {
	"output_category": "Food",
	"input_1": "Oven / Furnace",
	"input_2": "Apple Pie Dough",
	"output": "Apple Pie",
	"skill": "",
	"skill_level": null,
	"bonus": "Heals: +42, Poison Resistance: +10",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Oven / Furnace",
	"input_2": "Fish Dough",
	"output": "Cyseal Pie",
	"skill": "",
	"skill_level": null,
	"bonus": "Intelligence: +1, Speed: -1, Heals: +71",
	"notes": "",
	"source": ["Crafting and Cooking with Maradino"]
}, {
	"output_category": "Food",
	"input_1": "Oven / Furnace",
	"input_2": "Pizza Dough",
	"output": "Pizza",
	"skill": "",
	"skill_level": null,
	"bonus": "Constitution: +1, Speed: -1, Heals: +61",
	"notes": "",
	"source": ["Crafting and Cooking with Maradino"]
}, {
	"output_category": "Food",
	"input_1": "Oven / Furnace",
	"input_2": "Dough",
	"output": "Bread",
	"skill": "",
	"skill_level": null,
	"bonus": "Strength: +1, Speed: -1, Heals: +10",
	"notes": "",
	"source": ["Crafting and Cooking with Maradino"]
}, {
	"output_category": "Food",
	"input_1": "Knife / Dagger",
	"input_2": "Potato",
	"output": "Cold Rivellon Fires",
	"skill": "",
	"skill_level": null,
	"bonus": "Heals +7",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Hammer",
	"input_2": "Potato",
	"output": "Cold Mashed Potatoes",
	"skill": "",
	"skill_level": null,
	"bonus": "Strength: +1, Heals: +71",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Mug of Beer",
	"input_2": "Dinner",
	"output": "Dwarven Stew",
	"skill": "",
	"skill_level": null,
	"bonus": "Strength: +1, Heals: +74, 100% chance to get Slowed",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Mobile Kitchen / Oven / Furnace",
	"input_2": "Cold Mashed Potatoes",
	"output": "Cooked Mashed Potatoes",
	"skill": "",
	"skill_level": null,
	"bonus": "Strength: +1, Heals: +71",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Mobile Kitchen",
	"input_2": "Cold Rivellon Fries",
	"output": "Cooked Rivellon Fries",
	"skill": "",
	"skill_level": null,
	"bonus": "Constitution: +1, Dexterity: -1, Heals: +71",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Mobile Kitchen",
	"input_2": "Pumpkin",
	"output": "Pumpkin Soup",
	"skill": "",
	"skill_level": null,
	"bonus": "Perception: +1, Heals: +42",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Empty Cup",
	"input_2": "Orange",
	"output": "Orange Juice",
	"skill": "",
	"skill_level": null,
	"bonus": "Dexterity: +1, Heals: +18",
	"notes": "Does this work with mugs?",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Empty Cup",
	"input_2": "Apple",
	"output": "Apple Juice",
	"skill": "",
	"skill_level": null,
	"bonus": "Heals: +18, Poison Resistance: +10",
	"notes": "Also works with mugs",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Mobile Kitchen / Oven / Furnace",
	"input_2": "Any Fish",
	"output": "Dinner",
	"skill": "",
	"skill_level": null,
	"bonus": "Strength: +1, Heals: +74",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Cup of Water",
	"input_2": "Tea Herb",
	"output": "Cup of Tea",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Mug of Water",
	"input_2": "Tea Herb",
	"output": "Cup of Tea",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Bucket of Milk",
	"input_2": "Empty Cup",
	"output": "Cup of Milk",
	"skill": "",
	"skill_level": null,
	"bonus": "Heals: +18, Armor: +21",
	"notes": "You will lose the bucket",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Bucket",
	"input_2": "Cow",
	"output": "Bucket of Milk",
	"skill": "",
	"skill_level": null,
	"bonus": "Heals: +18, Armor: +21",
	"notes": "You can talk to the cow with the bucket in your inventory (needs Pet Pal)",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Mobile Kitchen",
	"input_2": "Potato",
	"output": "Boiled Potato",
	"skill": "",
	"skill_level": null,
	"bonus": "Constitution: +1, Heals: +22",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Jar",
	"input_2": "Beehive",
	"output": "Honey",
	"skill": "",
	"skill_level": null,
	"bonus": "Intelligence: +1, Heals: +16, Poison Resistance: +15%",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Honey",
	"input_2": "Cup of Milk",
	"output": "Milk Honey",
	"skill": "",
	"skill_level": null,
	"bonus": "Heals: +52, Armor: +32, Poison Resistance: +20%",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Milk Honey",
	"input_2": "Wheat",
	"output": "Porridge",
	"skill": "",
	"skill_level": null,
	"bonus": "Strength: +1, Heals: +18",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Milk Honey",
	"input_2": "Potato",
	"output": "Potato Porridge",
	"skill": "",
	"skill_level": null,
	"bonus": "Strength: +1, Heals: +39",
	"notes": "",
	"source": []
}, {
	"output_category": "Food",
	"input_1": "Cooking Pot",
	"input_2": "Campfire",
	"output": "Mobile Kitchen",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "Note:  Not all campfire are mobile.  Assume any that you make will be static.",
	"source": []
}, {
	"output_category": "Junk",
	"input_1": "Washboard",
	"input_2": "Washtub",
	"output": "Washtub w/ Board",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Minor Healing Potion",
	"input_2": "Apple",
	"output": "Antidote",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Medium Healing Potion",
	"input_2": "Apple",
	"output": "Antidote",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "No different from using a minor healing potion",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Large Healing Potion",
	"input_2": "Apple",
	"output": "Antidote",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "No different from using a minor healing potion",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Huge Healing Potion",
	"input_2": "Apple",
	"output": "Antidote",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "No different from using a minor healing potion",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Fire Resistance Potion",
	"input_2": "Water Resistance Potion",
	"output": "2x Empty Potion Bottles",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Earth Resistance Potion",
	"input_2": "Air Resistance Potion",
	"output": "2x Empty Potion Bottles",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Herb Augmentor",
	"input_2": "Any Potion",
	"output": "Potion +1 Level",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "Minor to Medium\nHealing Potion, Poison, Any Resist except Resist All, Invisibility, Telekinesis, Armor",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Herb Augmentor",
	"input_2": "Any Potion",
	"output": "Potion +1 Level",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "Minor to Medium\nAny Statistic (STR, DEX, INT, CON, SPD, PER), Resist All, Dexterity TempBoost, Intelligence TempBoost, Speed TempBoost, Medium >> Large, Poison Large, Any Resist except Resist All, Invisibility, Telekinesis, Armor Large",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Herb Augmentor",
	"input_2": "Any Potion",
	"output": "Potion +1 Level",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "Medium >> Large\nHealing Potion, Any Statistic (STR, DEX, INT, CON, SPD, PER), Resist All Potion, Dexterity TempBoost, Intelligence TempBoost, Speed TempBoost",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Empty Bottle",
	"input_2": "Penny Bun Mushroom",
	"output": "Minor Healing Potion",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Empty Bottle",
	"input_2": "Fly Agaric  Mushroom",
	"output": "Minor Poison Potion",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Empty Bottle",
	"input_2": "Rotten Eggs",
	"output": "Minor Poison Potion",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Empty Bottle",
	"input_2": "Ooze Barrel",
	"output": "Minor Poison Potion",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Empty Bottle",
	"input_2": "Whisperwood",
	"output": "Magical Armor Potion",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Empty Bottle",
	"input_2": "Drudanae",
	"output": "Poison Resistance Potion",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Empty Bottle",
	"input_2": "Guepinia",
	"output": "Fire Resistance Potion",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Empty Bottle",
	"input_2": "Bluegill",
	"output": "Water Resistance Potion",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Empty Bottle",
	"input_2": "Earth Tounge Mushroom",
	"output": "Earth Resistance Potion",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Empty Bottle",
	"input_2": "Yellowroom",
	"output": "Air Resistance Potion",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Empty Bottle",
	"input_2": "Essence - Void",
	"output": "Invisibility Potion",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Empty Bottle",
	"input_2": "Eye",
	"output": "Minor Perception Potion",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Empty Bottle",
	"input_2": "Fanny Blossom",
	"output": "Speed TempBoost Potion",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Empty Bottle",
	"input_2": "Farhangite",
	"output": "Constitution Potion",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Debuff <STAT> Potion",
	"input_2": "Debuff <STAT> Potion",
	"output": "Debuff All Potion",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "<STAT> is STR, DEX, INT, CON, SPD, or PER.  You need to 2 potions of different types, e.g, Debuff Strength + Debuff Dexterity = Debuff All",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Poison Potion",
	"input_2": "Bonedust",
	"output": "Debuff STR Potion",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Any poison potion (Minor, Medium, or Large) works.  Ooze barrel does not work.",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Poison Potion",
	"input_2": "Sinew",
	"output": "Debuff DEX Potion",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Any poison potion (Minor, Medium, or Large) works.  Ooze barrel does not work.",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Poison Potion",
	"input_2": "Tormented Soul",
	"output": "Debuff INT Potion",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Any poison potion (Minor, Medium, or Large) works.  Ooze barrel does not work.",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Poison Potion",
	"input_2": "Tooth",
	"output": "Debuff CON Potion",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Any poison potion (Minor, Medium, or Large) works.  Ooze barrel does not work.",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Poison Potion",
	"input_2": "Essence - Void",
	"output": "Debuff SPD Potion",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Any poison potion (Minor, Medium, or Large) works.  Ooze barrel does not work.",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Poison Potion",
	"input_2": "Eye",
	"output": "Debuff PER Potion",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Any poison potion (Minor, Medium, or Large) works.  Ooze barrel does not work.",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Minor Fire Resistance Potion",
	"input_2": "Minor Earth Resistance Potion",
	"output": "Minor Resist All Potion",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Minor Water Resistance Potion",
	"input_2": "Minor Air Resistance Potion",
	"output": "Minor Resist All Potion",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Minor Magical Armor Potion",
	"input_2": "Minor Air Resistance Potion",
	"output": "Minor Invisibility Potion",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Minor Resist All Potion",
	"input_2": "Drudanae",
	"output": "Minor Telekinesis Potion",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Minor Constitution Potion",
	"input_2": "Bonedust",
	"output": "Minor STR Potion",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Speed TempBoost Potion",
	"input_2": "Sinew",
	"output": "Minor DEX Potion",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Minor Perception Potion",
	"input_2": "Essence - Void",
	"output": "Minor INT Potion",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Minor Healing Potion",
	"input_2": "Minor Healing Potion",
	"output": "Medium Healing Potion",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Potion",
	"input_1": "Minor Healing Potion",
	"input_2": "Minor Healing Potion",
	"output": "Large Healing Potion",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Smithing Basic",
	"input_1": "Furnace",
	"input_2": "1H Sword",
	"output": "Iron Bar",
	"skill": "Blacksmithing",
	"skill_level": 1,
	"bonus": "",
	"notes": "Oven also works as a furnace",
	"source": []
}, {
	"output_category": "Smithing Basic",
	"input_1": "Furnace",
	"input_2": "1H Axe",
	"output": "Large Iron Bar",
	"skill": "Blacksmithing",
	"skill_level": 1,
	"bonus": "",
	"notes": "Oven also works as a furnace",
	"source": []
}, {
	"output_category": "Smithing Basic",
	"input_1": "Furnace",
	"input_2": "2H Sword",
	"output": "Steel Bar",
	"skill": "Blacksmithing",
	"skill_level": 1,
	"bonus": "",
	"notes": "Oven also works as a furnace",
	"source": ["He Who Smells It IV"]
}, {
	"output_category": "Smithing Basic",
	"input_1": "Furnace",
	"input_2": "2H Axe",
	"output": "Large Steel Bar",
	"skill": "Blacksmithing",
	"skill_level": 1,
	"bonus": "",
	"notes": "Oven also works as a furnace",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Iron Bar",
	"input_2": "Iron Bar",
	"output": "Large Iron Bar",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Smithing Basic",
	"input_1": "Furnace",
	"input_2": "Iron Ore",
	"output": "Iron Bar",
	"skill": "Blacksmithing",
	"skill_level": 1,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Smithing Basic",
	"input_1": "Pickaxe",
	"input_2": "Vein",
	"output": "Ore",
	"skill": "Blacksmithing",
	"skill_level": null,
	"bonus": "",
	"notes": "Ore type depends on type of vein. Can be used 5 times",
	"source": []
}, {
	"output_category": "Smithing Basic",
	"input_1": "Furnace",
	"input_2": "Silver Ore",
	"output": "Silver Bar",
	"skill": "Blacksmithing",
	"skill_level": 2,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Smithing Basic",
	"input_1": "Furnace",
	"input_2": "Tenebrium Ore",
	"output": "Tenebrium Bar",
	"skill": "Blacksmithing",
	"skill_level": 4,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Furnace",
	"input_2": "Iron Bar",
	"output": "Steel Bar",
	"skill": "Blacksmithing",
	"skill_level": 1,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Furnace",
	"input_2": "Large Iron Bar",
	"output": "Large Steel Bar",
	"skill": "Blacksmithing",
	"skill_level": 1,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Special",
	"input_1": "Branch",
	"input_2": "Nine-inch Nails",
	"output": "Branch with Nails",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Special",
	"input_1": "Knife / Dagger",
	"input_2": "Log",
	"output": "Wooden Stake",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": ["Crafting and Cooking with Maradino"]
}, {
	"output_category": "Special",
	"input_1": "Knife / Dagger",
	"input_2": "Pumpkin",
	"output": "Pumpkin Helmet",
	"skill": "",
	"skill_level": null,
	"bonus": "Fire Resistance: +10% (IL1) / +15% (IL3) / +20% (IL8) / +25%(IL13) / +30%(IL18). 5% chance to set Feared Status",
	"notes": "",
	"source": []
}, {
	"output_category": "Special",
	"input_1": "Hammer",
	"input_2": "Cooking Pot",
	"output": "Cracked/Battered Cookpot Helmet",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": ["The Adventurer's Field Guide XVIII"]
}, {
	"output_category": "Special",
	"input_1": "Buffalo Amulet",
	"input_2": "Rusty Sabre",
	"output": "Buffalo Sabre",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "Damage, and Strength bonus",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Special",
	"input_1": "Fiery Heart",
	"input_2": "Swirling Mud",
	"output": "Sword of Planets",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Special",
	"input_1": "Branch",
	"input_2": "Tenebrium Ore",
	"output": "Wand of the Shambling Mound",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Special",
	"input_1": "Mobile Kitchen / Oven / Furnace",
	"input_2": "Ishamashell",
	"output": "Cooked Ishamashell",
	"skill": "",
	"skill_level": null,
	"bonus": "100% chance to set Infectious Diseased status",
	"notes": "This that shell you meet on the beach that wants to be tossed back into the sea",
	"source": []
}, {
	"output_category": "Special",
	"input_1": "Oven / Furnace",
	"input_2": "Iron Bone",
	"output": "Iron Bar",
	"skill": "Blacksmithing",
	"skill_level": 1,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blossius's Will",
	"input_2": "Ink Pot and Quill",
	"output": "Blossius's Adapted Will",
	"skill": "Crafting",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blossius's Will",
	"input_2": "Magic Ink Pot and Quill",
	"output": "Blossius's Adapted Will",
	"skill": "Crafting",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Fire Scroll",
	"input_2": "Blank Fire Scroll",
	"output": "Blank Fire Skillbook",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Earth Scroll",
	"input_2": "Blank Earth Scroll",
	"output": "Blank Earth Skillbook",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Air Scroll",
	"input_2": "Blank Air Scroll",
	"output": "Blank Air Skillbook",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "",
	"source": [""]
}, {
	"output_category": "Spell",
	"input_1": "Parchment",
	"input_2": "Air Essence",
	"output": "Blank Air Scroll",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Water Scroll",
	"input_2": "Blank Water Scroll",
	"output": "Blank Water Skillbook",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Witchcraft Scroll",
	"input_2": "Blank Witchcraft Scroll",
	"output": "Blank Witchcraft Skillbook",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Magic Inkpot",
	"input_2": "Blank Air Scroll",
	"output": "Air Skill Scroll",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "AirShield, AirSummon, Blink, BlitzBoltStart, ChillyWind, FarSight, InstantPressure, RemovePetrification, TeleportationFreeFall",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Magic Inkpot",
	"input_2": "Blank Air Scroll",
	"output": "Air Skill Scroll",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "Level 2 plus:  FeatherFall, ImmuneToElectrify, InvisibilitySelf, LightningStrike, ShockingHands",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Magic Inkpot",
	"input_2": "Blank Air Scroll",
	"output": "Air Skill Scroll",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "Level 2-3 plus:  BlitzBolt, Tornado",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Magic Inkpot",
	"input_2": "Blank Air Scroll",
	"output": "Air Skill Scroll",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "Level 2-4 plus:  ChainLightning, InvisibilityTarget, LightningStorm",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Magic Inkpot",
	"input_2": "Blank Earth Scroll",
	"output": "Earth Skill Scroll",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "EarthShield, EarthSummon, Fortify, ImmuneToPoisoning, PoisonDartStart, SummonWolf, TargetedBless, TargetedOilSurface",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Magic Inkpot",
	"input_2": "Blank Earth Scroll",
	"output": "Earth Skill Scroll",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "Level 2 plus:  BoulderDash, PetrifyingTouch, PoisonDart, SummonBloodSwarm",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Magic Inkpot",
	"input_2": "Blank Earth Scroll",
	"output": "Earth Skill Scroll",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "Level 2-3 plus:  BlessedEarth, DeadlySpores, NaturesCurse, OozeSpray, SummonSpider",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Magic Inkpot",
	"input_2": "Blank Earth Scroll",
	"output": "Earth Skill Scroll",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "Level 2-4 plus:  Earthquake",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Leandra's Spell",
	"input_2": "Vial of Leandra's Blood",
	"output": "Death Knight Bane Skillbook",
	"skill": "Crafting",
	"skill_level": null,
	"bonus": "",
	"notes": "You need this to be able to harm death knights",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Magic Inkpot",
	"input_2": "Blank Fire Scroll",
	"output": "Fire Skill Scroll",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "BurningTouch, CreateSmokescreen, Fireball, FireFly, FireShield, FireSummon, Flare, FlareStart, Haste, ImmuneToFreeze, TargetedPerceptionBoost",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Magic Inkpot",
	"input_2": "Blank Fire Scroll",
	"output": "Fire Skill Scroll",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "Level 2 plus:  FireSurfaceSelf, PurifyingFire",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Magic Inkpot",
	"input_2": "Blank Fire Scroll",
	"output": "Fire Skill Scroll",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "Level 2-3 plus:  ExplodeSelf, Immolate",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Magic Inkpot",
	"input_2": "Blank Fire Scroll",
	"output": "Fire Skill Scroll",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "Level 2-4 plus:  InfectiousFlame, MeteorStrike, ",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Magic Inkpot",
	"input_2": "Blank Water Scroll",
	"output": "Water Skill Scroll",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "ChillingTouch, IceShardStart, IceSummon, Rain, RegenerateStart, Slow, WaterOfLife, WaterShield",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Magic Inkpot",
	"input_2": "Blank Water Scroll",
	"output": "Water Skill Scroll",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "Level 2 plus:  CleansingWater, IceShard, IceWall, ImmuneToBurning, RegenerateMedium",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Magic Inkpot",
	"input_2": "Blank Water Scroll",
	"output": "Water Skill Scroll",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "Level 2-3 plus:  MassDisease, RegenerateMajor, WinterbreathMedium",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Magic Inkpot",
	"input_2": "Blank Water Scroll",
	"output": "Water Skill Scroll",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "Level 2-4 plus:  HailAttack, SlowMass",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Magic Inkpot",
	"input_2": "Blank Witchcraft Scroll",
	"output": "Witchcraft Skill Scroll",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Bleed, Blind, MagicalUnlock, Resurrect, TargetedCurse, TargetedDamageBoost, WeakeningTouch",
	"source": ["Secrets of the Scroll V"]
}, {
	"output_category": "Spell",
	"input_1": "Magic Inkpot",
	"input_2": "Blank Witchcraft Scroll",
	"output": "Witchcraft Skill Scroll",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "Level 2 plus:  BanishSummon, CreateUndead, DrainWillpower, EndureElements, VampiricTouch",
	"source": ["Secrets of the Scroll V"]
}, {
	"output_category": "Spell",
	"input_1": "Magic Inkpot",
	"input_2": "Blank Witchcraft Scroll",
	"output": "Witchcraft Skill Scroll",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "Level 2-3 plus:  CauseFear, CreateGreaterUndead, Enervation, MassWeakness",
	"source": ["Secrets of the Scroll V"]
}, {
	"output_category": "Spell",
	"input_1": "Magic Inkpot",
	"input_2": "Blank Witchcraft Scroll",
	"output": "Witchcraft Skill Scroll",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "Level 2-4 plus:  FingerOfDeath, Invulnerability",
	"source": ["Secrets of the Scroll V"]
}, {
	"output_category": "Spell",
	"input_1": "Blank Air Skillbook",
	"input_2": "Air Skill Scroll",
	"output": "Air Skillbook",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "ChillyWind, InstantPressure, BlitzBoltStart, FarSight, Teleportation FreeFall",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Air Skillbook",
	"input_2": "Air Skill Scroll",
	"output": "Air Skillbook",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "Blink, ShockingHands, MultiStrike LightningStrike",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Air Skillbook",
	"input_2": "Air Skill Scroll",
	"output": "Air Skillbook",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "FeatherFall, ImmuneToElectrify, RemovePetrification, InvisibilitySelf, Shield Air, Projectile BlitzBolt, Tornado Air, Summon Air",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Air Skillbook",
	"input_2": "Air Skill Scroll",
	"output": "Air Skillbook",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "InvisibilityTarget, Storm Lightning, ChainLightning",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Earth Skillbook",
	"input_2": "Earth Skill Scroll",
	"output": "Earth Skillbook",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "SummonSpider, TargetedOilSurface, PoisonDartStart, Fortify, TargetedBless",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Earth Skillbook",
	"input_2": "Earth Skill Scroll",
	"output": "Earth Skillbook",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "ImmuneToPoisoning, Shield Earth, Boulder BoulderDash",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Earth Skillbook",
	"input_2": "Earth Skill Scroll",
	"output": "Earth Skillbook",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "SummonBloodSwarm, BlessedEarth, NaturesCurse, SummonWolf, PetrifyingTouch, Projectile PoisonDart, Cone OozeSpray, DeadlySpores",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Earth Skillbook",
	"input_2": "Earth Skill Scroll",
	"output": "Earth Skillbook",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "Summon Earth, Quake Earthquake",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Fire Skillbook",
	"input_2": "Fire Skill Scroll",
	"output": "Fire Skillbook",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "BurningTouch, FlareStart, Haste, ImmuneToFreeze, Path FireFly",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Fire Skillbook",
	"input_2": "Fire Skill Scroll",
	"output": "Fire Skillbook",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "Projectile Fireball, Summon Fire, TargetedPerceptionBoost",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Fire Skillbook",
	"input_2": "Fire Skill Scroll",
	"output": "Fire Skillbook",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "Cleanse PurifyingFire, CreateSmokescreen, ExplodeSelf, FireSurfaceSelf, Immolate, Projectile Flare, Shield Fire",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Fire Skillbook",
	"input_2": "Fire Skill Scroll",
	"output": "Fire Skillbook",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "InfectiousFlame, MeteorStrike",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Water Skillbook",
	"input_2": "Water Skill Scroll",
	"output": "Water Skillbook",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Slow, RegenerateStart, WaterOfLife, IceShardStart, Rain Water",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Water Skillbook",
	"input_2": "Water Skill Scroll",
	"output": "Water Skillbook",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "ChillingTouch, Shield Water",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Water Skillbook",
	"input_2": "Water Skill Scroll",
	"output": "Water Skillbook",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "CleansingWater, ImmuneToBurning, MassDisease, WinterbreathMedium, Projectile IceShard, Summon Ice, RegenerateMedium, RegenerateMajor, Wall Ice",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Water Skillbook",
	"input_2": "Water Skill Scroll",
	"output": "Water Skillbook",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "SlowMass, HailAttack",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Witchcraft Skillbook",
	"input_2": "Witchcraft Skill Scroll",
	"output": "Witchcraft Skillbook",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "WeakeningTouch, TargetedDamageBoost, TargetedCurse, Blind, Bleed",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Witchcraft Skillbook",
	"input_2": "Witchcraft Skill Scroll",
	"output": "Witchcraft Skillbook",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "EndureElements, CreateUndead",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Witchcraft Skillbook",
	"input_2": "Witchcraft Skill Scroll",
	"output": "Witchcraft Skillbook",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "MassWeakness, Enervation, DrainWillpower, CreateGreaterUndead, CauseFear, BanishSummon",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Witchcraft Skillbook",
	"input_2": "Witchcraft Skill Scroll",
	"output": "Witchcraft Skillbook",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "",
	"notes": "Invulnerability, FingerOfDeath",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Wood Chips",
	"input_2": "Bucket of Water",
	"output": "Wood Mush, Empty Bucket",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": ["Secrets of the Scroll VI"]
}, {
	"output_category": "Spell",
	"input_1": "Wood Chips",
	"input_2": "Well",
	"output": "Wood Mush",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": ["Secrets of the Scroll VI"]
}, {
	"output_category": "Spell",
	"input_1": "Wood Chips",
	"input_2": "Barrel of Water",
	"output": "Wood Mush",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Wood Mush",
	"input_2": "Oven",
	"output": "Paper",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "Oven is same as Furnace",
	"source": ["Secrets of the Scroll VI"]
}, {
	"output_category": "Spell",
	"input_1": "Paper",
	"input_2": "Pixie Dust",
	"output": "Random blank scroll",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Water, Fire, Earth, Air, or Witchcraft",
	"source": []
}, {
	"output_category": "Spell",
	"input_1": "Blank Air Scroll",
	"input_2": "Magic Ink Pot and Quill",
	"output": "Random Air Scroll",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "[C2]: Air Resistance Shield, Summon Air Elemental, Become Air, Blitz Bolt, Bitter Cold, Headvice, Remove Petrification, or Teleportation. [C3]: + Feather Drop, Immune to Electrified, Invisibility, Lightning Strike, or Shocking Touch. [C4]: + Tornado. [C5]: + Chain Lightning, Make Invisible, or Storm.",
	"notes": "",
	"source": ["Secrets of the Scroll V"]
}, {
	"output_category": "Spell",
	"input_1": "Blank Earth Scroll",
	"input_2": "Magic Ink Pot and Quill",
	"output": "Random Earth Scroll",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "[C2]: Earth Resistance Shield, Summon Earth Elemental, Fortify, Immune to Poisoning, Magical Poison Dart, Summon Wolf, Bless, or Midnight Oil. [C3]: + Bolder Dash, Petrifying Touch, or Summon Bloodswarm. [C4]: + Deadly Spores, Natures Curse, Acid Breath, or Summon Spider. [C5]: + Earthquake.",
	"notes": "",
	"source": ["Secrets of the Scroll V"]
}, {
	"output_category": "Spell",
	"input_1": "Blank Fire Scroll",
	"input_2": "Magic Ink Pot and Quill",
	"output": "Random Fire Scroll",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "[C2]: Burning Touch, Smokescreen, Small Fireball, Fire Resistance Shield, Summon Fire Elemental, Flare, Haste, Immune to Freezing, or Burn My Eyes. [C3]: + Purifying Fire, or Firefly. [C4]: + Immolation. [C5]: + Meteor Shower, or Infectious Flame.",
	"notes": "",
	"source": ["Secrets of the Scroll V"]
}, {
	"output_category": "Spell",
	"input_1": "Blank Water Scroll",
	"input_2": "Magic Ink Pot and Quill",
	"output": "Random Water Scroll",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "[C2]: Slow Current, Ice Shard, Summon Ice Elemental, Rain, Minor Heal, Slow, Water of Life, or Water Resistance Shield. [C3]: + Cleansing Water, Pierding Ice Shard, Ice Wall, Immunity to Burning, or Strong Regenerate. [C4]: + Mass Disease, Freezing Touch. [C5]: + Hail Attack, or Winterblast.",
	"notes": "",
	"source": ["Secrets of the Scroll V"]
}, {
	"output_category": "Spell",
	"input_1": "Blank Witchcraft Scroll",
	"input_2": "Magic Ink Pot and Quill",
	"output": "Random Witchcraft Scroll",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "[C2]: Bloodletting, Blind, Magical Unlock, Resurrect (Scroll only), Malediction, Oath Of Desecration, or Enfeebling Touch. [C3]: + Destroy Summon, Summon Undead Warrior, Drain Willpower, Absorb The Elements, or Vampiric Touch. [C4]: + Horrific Scream, Soulsap, Summon Armoured Undead Decapitator, or Mass Weakness. [C5]: + Death Punch, or Invulnerability.",
	"notes": "",
	"source": ["Secrets of the Scroll V"]
}, {
	"output_category": "Spell",
	"input_1": "Quill",
	"input_2": "Ink Pot",
	"output": "Quill & Ink Pot",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": ["Secrets of the Scroll IV"]
}, {
	"output_category": "Spell",
	"input_1": "Knife / Dagger",
	"input_2": "Feather",
	"output": "Quill",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": ["Secrets of the Scroll IV"]
}, {
	"output_category": "Tool",
	"input_1": "Needle",
	"input_2": "Needle",
	"output": "Lockpick",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Tool",
	"input_1": "Needle",
	"input_2": "Wooden Figurine",
	"output": "Inactive Voodoo Doll",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "Add pixie dust to the doll",
	"source": []
}, {
	"output_category": "Tool",
	"input_1": "Needle",
	"input_2": "Cloth Scraps",
	"output": "Wood Figurine",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Tool",
	"input_1": "Inactive Voodoo Doll",
	"input_2": "Pixie Dust",
	"output": "Voodoo Doll",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Tool",
	"input_1": "Inactive Voodoo Doll",
	"input_2": "Pixie Dust",
	"output": "Voodoo Doll",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Tool",
	"input_1": "Inactive Voodoo Doll",
	"input_2": "Pixie Dust",
	"output": "Voodoo Doll",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "20% to set Bleeding status bonus.",
	"notes": "",
	"source": []
}, {
	"output_category": "Tool",
	"input_1": "Inactive Voodoo Doll",
	"input_2": "Pixie Dust",
	"output": "Voodoo Doll",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "40 to set Bleeding status bonus.",
	"notes": "",
	"source": []
}, {
	"output_category": "Tool",
	"input_1": "Inactive Voodoo Doll",
	"input_2": "Pixie Dust",
	"output": "Voodoo Doll",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "75% to set Bleeding status bonus.",
	"notes": "",
	"source": []
}, {
	"output_category": "Tool",
	"input_1": "Ink Pot",
	"input_2": "Pixie Dust",
	"output": "Magic Ink Pot",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Tool",
	"input_1": "Hammer",
	"input_2": "Nails",
	"output": "Lockpick x4",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Repair hammer also works",
	"source": []
}, {
	"output_category": "Tool",
	"input_1": "Soap",
	"input_2": "Key",
	"output": "Lockpick",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "Key is not consumed",
	"source": []
}, {
	"output_category": "Useful",
	"input_1": "Rope",
	"input_2": "Leather Scraps",
	"output": "Backpack",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Shears + Sheep or shops can provide Wool.  4x Wool = 2x yarn = 1x Rope. Rope is used to make Belts and Backpacks.",
	"source": []
}, {
	"output_category": "Useless",
	"input_1": "Hammer",
	"input_2": "Skull",
	"output": "Nothing",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Useless",
	"input_1": "Hammer",
	"input_2": "Bone",
	"output": "Nothing",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Dagger",
	"input_2": "Branch",
	"output": "Homemade Spear",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Dagger",
	"input_2": "Branch",
	"output": "Homemade Spear",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Dagger",
	"input_2": "Branch",
	"output": "Homemade Spear",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Dagger",
	"input_2": "Branch",
	"output": "Homemade Spear",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Dagger",
	"input_2": "Branch",
	"output": "Homemade Spear",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "Lg. DMG+, Lg. CRIT+",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Branch",
	"input_2": "Branch",
	"output": "Homemade Staff",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Branch",
	"input_2": "Branch",
	"output": "Homemade Staff",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "Luck+",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Branch",
	"input_2": "Branch",
	"output": "Homemade Staff",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "Luck+",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Branch",
	"input_2": "Branch",
	"output": "Homemade Staff",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "Luck+, AP+, INT+",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Knife",
	"output": "Homemade Dagger",
	"skill": "Blacksmithing",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Knife",
	"output": "Homemade Dagger",
	"skill": "Blacksmithing",
	"skill_level": 2,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Knife",
	"output": "Homemade Dagger",
	"skill": "Blacksmithing",
	"skill_level": 3,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Knife",
	"output": "Homemade Dagger",
	"skill": "Blacksmithing",
	"skill_level": 4,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Knife",
	"output": "Homemade Dagger",
	"skill": "Blacksmithing",
	"skill_level": 5,
	"bonus": "Sm. Speed+, Sm. DEX+, Lg. LCK+, Sm. AP+",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Iron Bar",
	"output": "Homemade 1H Sword",
	"skill": "Blacksmithing",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Iron Bar",
	"output": "Homemade 1H Sword",
	"skill": "Blacksmithing",
	"skill_level": 2,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Iron Bar",
	"output": "Homemade 1H Sword",
	"skill": "Blacksmithing",
	"skill_level": 3,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Iron Bar",
	"output": "Homemade 1H Sword",
	"skill": "Blacksmithing",
	"skill_level": 4,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Iron Bar",
	"output": "Homemade 1H Sword",
	"skill": "Blacksmithing",
	"skill_level": 5,
	"bonus": "Lg.  DMG+, Sm. AP+",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Steel Bar",
	"output": "Homemade 1H Axe",
	"skill": "Blacksmithing",
	"skill_level": 1,
	"bonus": "B5: Critical Chance, Damage, or Max Action Points bonus",
	"notes": "Leveled to player",
	"source": ["He Who Smells It II"]
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Steel Bar",
	"output": "Homemade 1H Axe",
	"skill": "Blacksmithing",
	"skill_level": 2,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Steel Bar",
	"output": "Homemade 1H Axe",
	"skill": "Blacksmithing",
	"skill_level": 3,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Steel Bar",
	"output": "Homemade 1H Axe",
	"skill": "Blacksmithing",
	"skill_level": 4,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Steel Bar",
	"output": "Homemade 1H Axe",
	"skill": "Blacksmithing",
	"skill_level": 5,
	"bonus": "Lg.  DMG+, Lg. CRIT+, Sm. AP+",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Large Iron Bar",
	"output": "Homemade 2H Sword",
	"skill": "Blacksmithing",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Large Iron Bar",
	"output": "Homemade 2H Sword",
	"skill": "Blacksmithing",
	"skill_level": 2,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Large Iron Bar",
	"output": "Homemade 2H Sword",
	"skill": "Blacksmithing",
	"skill_level": 3,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Large Iron Bar",
	"output": "Homemade 2H Sword",
	"skill": "Blacksmithing",
	"skill_level": 4,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Large Iron Bar",
	"output": "Homemade 2H Sword",
	"skill": "Blacksmithing",
	"skill_level": 5,
	"bonus": "Lg. DMG+, Sm. STR+",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Large Steel Bar",
	"output": "Homemade 2H Axe",
	"skill": "Blacksmithing",
	"skill_level": 2,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Large Steel Bar",
	"output": "Homemade 2H Axe",
	"skill": "Blacksmithing",
	"skill_level": 3,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Large Steel Bar",
	"output": "Homemade 2H Axe",
	"skill": "Blacksmithing",
	"skill_level": 4,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Anvil",
	"input_2": "Large Steel Bar",
	"output": "Homemade 2H Axe",
	"skill": "Blacksmithing",
	"skill_level": 5,
	"bonus": "Lg.  DMG+, Lg. CRIT+",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Sinew",
	"input_2": "Sinew",
	"output": "Bowstring",
	"skill": "",
	"skill_level": null,
	"bonus": "",
	"notes": "No, you cannot use Strong Sinew.",
	"source": ["The String Enthusiast I"]
}, {
	"output_category": "Weapon",
	"input_1": "Branch",
	"input_2": "Bowstring",
	"output": "Homemade Bow",
	"skill": "Crafting",
	"skill_level": 1,
	"bonus": "",
	"notes": "Leveled to player",
	"source": ["The String Enthusiast I"]
}, {
	"output_category": "Weapon",
	"input_1": "Branch",
	"input_2": "Bowstring",
	"output": "Homemade Bow",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Leveled to player",
	"source": ["The String Enthusiast I"]
}, {
	"output_category": "Weapon",
	"input_1": "Branch",
	"input_2": "Bowstring",
	"output": "Homemade Bow",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "Leveled to player",
	"source": ["The String Enthusiast I"]
}, {
	"output_category": "Weapon",
	"input_1": "Branch",
	"input_2": "Bowstring",
	"output": "Homemade Bow",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Branch",
	"input_2": "Bowstring",
	"output": "Homemade Bow",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "Dexterity, Max Action Points, or Speed bonus",
	"notes": "Leveled to player",
	"source": ["The String Enthusiast I"]
}, {
	"output_category": "Weapon",
	"input_1": "Branch",
	"input_2": "Iron Bar",
	"output": "Crossbow (without String)",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Leveled to player",
	"source": ["The String Enthusiast I"]
}, {
	"output_category": "Weapon",
	"input_1": "Crossbow (without String)",
	"input_2": "Bowstring",
	"output": "Homemade Crossbow",
	"skill": "Crafting",
	"skill_level": 2,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Crossbow (without String)",
	"input_2": "Bowstring",
	"output": "Homemade Crossbow",
	"skill": "Crafting",
	"skill_level": 3,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Crossbow (without String)",
	"input_2": "Bowstring",
	"output": "Homemade Crossbow",
	"skill": "Crafting",
	"skill_level": 4,
	"bonus": "",
	"notes": "Leveled to player",
	"source": []
}, {
	"output_category": "Weapon",
	"input_1": "Crossbow (without String)",
	"input_2": "Bowstring",
	"output": "Homemade Crossbow",
	"skill": "Crafting",
	"skill_level": 5,
	"bonus": "Critical Chance, Damage, or Dexterity bonus",
	"notes": "Leveled to player"
}]
},{}],8:[function(require,module,exports){
var Model = require('backbone').Model;

module.exports = Model.extend({
	defaults: {
		input_1: '',
		input_2: '',
		notes: null,
		output: '',
		output_category: '',
		skill: null,
		skill_level: null
	}
});
},{"backbone":2}],9:[function(require,module,exports){
var jade = require('jade/lib/runtime.js');
module.exports=function(params) { if (params) {params.require = require;} return (
function template(locals) {
var jade_debug = [{ lineno: 1, filename: "/Users/chahinet2r/Sites/divinity-crafting/src/js/templates/combinations.jade" }];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (undefined, items) {


buf.push("<ul>");


// iterate items
;(function(){
  var $$obj = items;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var item = $$obj[$index];



buf.push("<li class=\"item\">");



buf.push("<div class=\"item-content\">");


buf.push("<div class=\"arrow\">");


buf.push("</div>");


buf.push("<h3 class=\"item-title\">" + (jade.escape(null == (jade_interp = item.get('output')) ? "" : jade_interp)));


buf.push("</h3>");


buf.push("<span class=\"item-subtitle\">" + (jade.escape(null == (jade_interp = item.get('output_category')) ? "" : jade_interp)));


buf.push("</span>");


if ( item.get('notes'))
{


buf.push("<h4 class=\"item-section-title\">");


buf.push("Notes");


buf.push("</h4>");


buf.push("<p>" + (jade.escape(null == (jade_interp = item.get('notes')) ? "" : jade_interp)));


buf.push("</p>");


}


if ( item.get('bonus'))
{


buf.push("<h4 class=\"item-section-title\">");


buf.push("Bonus");


buf.push("</h4>");


buf.push("<p>" + (jade.escape(null == (jade_interp = item.get('bonus')) ? "" : jade_interp)));


buf.push("</p>");


}


if ( item.get('skill'))
{


buf.push("<h4 class=\"item-section-title highlight\">");


if ( item.get('skill').toLowerCase() === 'crafting')
{


buf.push("<div class=\"fa fa-flask\">");


buf.push("</div>");


}
else if ( item.get('skill').toLowerCase() === 'blacksmithing')
{


buf.push("<div class=\"fa fa-gavel\">");


buf.push("</div>");


}


buf.push("<span>" + (jade.escape(null == (jade_interp = item.get('skill') + ' ' + item.get('skill_level')) ? "" : jade_interp)));


buf.push("</span>");


buf.push("</h4>");


}


buf.push("</div>");


buf.push("<div class=\"item-inputs\">");


buf.push("<div class=\"item-input\">" + (jade.escape(null == (jade_interp = item.get('input_1')) ? "" : jade_interp)));


buf.push("</div>");


buf.push("<div class=\"fa fa-bolt\">");


buf.push("</div>");


buf.push("<div class=\"item-input\">" + (jade.escape(null == (jade_interp = item.get('input_2')) ? "" : jade_interp)));


buf.push("</div>");


buf.push("</div>");



buf.push("</li>");


    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var item = $$obj[$index];



buf.push("<li class=\"item\">");



buf.push("<div class=\"item-content\">");


buf.push("<div class=\"arrow\">");


buf.push("</div>");


buf.push("<h3 class=\"item-title\">" + (jade.escape(null == (jade_interp = item.get('output')) ? "" : jade_interp)));


buf.push("</h3>");


buf.push("<span class=\"item-subtitle\">" + (jade.escape(null == (jade_interp = item.get('output_category')) ? "" : jade_interp)));


buf.push("</span>");


if ( item.get('notes'))
{


buf.push("<h4 class=\"item-section-title\">");


buf.push("Notes");


buf.push("</h4>");


buf.push("<p>" + (jade.escape(null == (jade_interp = item.get('notes')) ? "" : jade_interp)));


buf.push("</p>");


}


if ( item.get('bonus'))
{


buf.push("<h4 class=\"item-section-title\">");


buf.push("Bonus");


buf.push("</h4>");


buf.push("<p>" + (jade.escape(null == (jade_interp = item.get('bonus')) ? "" : jade_interp)));


buf.push("</p>");


}


if ( item.get('skill'))
{


buf.push("<h4 class=\"item-section-title highlight\">");


if ( item.get('skill').toLowerCase() === 'crafting')
{


buf.push("<div class=\"fa fa-flask\">");


buf.push("</div>");


}
else if ( item.get('skill').toLowerCase() === 'blacksmithing')
{


buf.push("<div class=\"fa fa-gavel\">");


buf.push("</div>");


}


buf.push("<span>" + (jade.escape(null == (jade_interp = item.get('skill') + ' ' + item.get('skill_level')) ? "" : jade_interp)));


buf.push("</span>");


buf.push("</h4>");


}


buf.push("</div>");


buf.push("<div class=\"item-inputs\">");


buf.push("<div class=\"item-input\">" + (jade.escape(null == (jade_interp = item.get('input_1')) ? "" : jade_interp)));


buf.push("</div>");


buf.push("<div class=\"fa fa-bolt\">");


buf.push("</div>");


buf.push("<div class=\"item-input\">" + (jade.escape(null == (jade_interp = item.get('input_2')) ? "" : jade_interp)));


buf.push("</div>");


buf.push("</div>");



buf.push("</li>");


    }

  }
}).call(this);



buf.push("</ul>");

}.call(this,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"items" in locals_for_with?locals_for_with.items:typeof items!=="undefined"?items:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, "ul\n    each item in items\n        li.item\n            include ./partials/card.jade");
}
}
)(params); }

},{"jade/lib/runtime.js":4}],10:[function(require,module,exports){
var jade = require('jade/lib/runtime.js');
module.exports=function(params) { if (params) {params.require = require;} return (
function template(locals) {
var jade_debug = [{ lineno: 1, filename: "/Users/chahinet2r/Sites/divinity-crafting/src/js/templates/header.jade" }];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (undefined, title) {


buf.push("<div class=\"menu\">");


buf.push("<div class=\"burger\">");


buf.push("<div class=\"fa fa-bars\">");


buf.push("</div>");


buf.push("</div>");


buf.push("<h1>" + (jade.escape(null == (jade_interp = title) ? "" : jade_interp)));


buf.push("</h1>");


buf.push("<div class=\"sidebar\">");


buf.push("<ul>");


buf.push("<li>");


buf.push("About");


buf.push("</li>");


buf.push("</ul>");


buf.push("</div>");


buf.push("<h2 class=\"subtitle\">");


buf.push("Items");


buf.push("</h2>");


buf.push("<div class=\"find\">");


buf.push("<div class=\"fa fa-search\">");


buf.push("</div>");


buf.push("</div>");


buf.push("</div>");

}.call(this,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"title" in locals_for_with?locals_for_with.title:typeof title!=="undefined"?title:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, ".menu\n  .burger\n    .fa.fa-bars\n  h1= title\n  .sidebar\n    ul\n      li About\n  h2.subtitle Items\n  .find\n    .fa.fa-search");
}
}
)(params); }

},{"jade/lib/runtime.js":4}],11:[function(require,module,exports){
var jade = require('jade/lib/runtime.js');
module.exports=function(params) { if (params) {params.require = require;} return (
function template(locals) {
var jade_debug = [{ lineno: 1, filename: "/Users/chahinet2r/Sites/divinity-crafting/src/js/templates/input.jade" }];
try {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (undefined) {


buf.push("<div class=\"fa fa-search\">");


buf.push("</div>");


buf.push("<input type=\"search\" placeholder=\"Ingredient\"/>");

}.call(this,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
} catch (err) {
  jade.rethrow(err, jade_debug[0].filename, jade_debug[0].lineno, ".fa.fa-search\ninput(type='search', placeholder='Ingredient')");
}
}
)(params); }

},{"jade/lib/runtime.js":4}],12:[function(require,module,exports){
var _ = require('underscore');
var View = require('backbone').View;
var template = require('../templates/combinations.jade');


module.exports = View.extend({
	tagName: 'ul',
	className: 'item-combo-list',
	events: {
		'click .item-title, .arrow': 'toggle'
	},

	initialize: function() {
		this.collection.on('reset', this.render, this);
		this.render();

	},

	toggle: function(e) {
		$(e.currentTarget).parent().toggleClass('active');
	},
	render: function() {
		this.$el.html(template({
			items: this.collection.models,
			title: 'Combinations'
		}));
	},

});
},{"../templates/combinations.jade":9,"backbone":2,"underscore":5}],13:[function(require,module,exports){
var View = require('backbone').View;
var template = require('../templates/header.jade');

module.exports = View.extend({
  tagName: 'div',
  className: 'header',

  initialize: function() {
    this.render();
  },

  render: function() {
    this.$el.html(template({
      title: 'Crafty'
    }));
  }
});
},{"../templates/header.jade":10,"backbone":2}],14:[function(require,module,exports){
var View = require('backbone').View;
var _ = require('underscore');
var template = require('../templates/input.jade');

module.exports = View.extend({
	tagName: 'div',
	className: 'input',

	events: {
		'input input': 'change'
	},

	initialize: function() {
		this.render();
	},

	render: function() {
		this.$el.html(template());
	},

	change: function(e) {
		var val = $(e.currentTarget).val();
		if (!_.isEmpty(val)) {
			this.setFilter(this.collection, val);
		} else {
			this.collection.reset(this.collection.originalModels);
		}
	},

	setFilter: _.debounce(function(collection, val) {
		collection.findByIngredient(val);
	}, 500)

});
},{"../templates/input.jade":11,"backbone":2,"underscore":5}]},{},[1]);
