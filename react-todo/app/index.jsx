/** @jsx React.DOM */

(function () {



	// TaskApp component
	var TasksApp = React.createClass({
		render: function () {
			return (
				<div className="col-xs-12 col-sm-6 col-sm-offset-3">
					<h3>asteroid todo</h3>
					<br />
					<TaskForm />
					<TasksList tasks={this.props.tasks} />
				</div>
			);
		}
	});

	// TaskList component
	var TasksList = React.createClass({
		render: function () {
			var tasksNodes = this.props.tasks.map(function (task) {
				return (
					<TaskSummary task={task} key={task._id} />
				);
			});
			return (
				<ul className="list-group">
					{tasksNodes}
				</ul>
			);
		}
	});

	// TaskSummary component
	var TaskSummary = React.createClass({
		toggleStatus: function () {
			Tasks.update(this.props.task._id, {
				done: !this.props.task.done
			});
		},
		deleteTask: function () {
			Tasks.remove(this.props.task._id);
		},
		render: function () {
			var done;
			var description;
			if (this.props.task.done) {
				done = <i className="fa fa-check-square-o" onClick={this.toggleStatus}></i>;
				description = <s>{this.props.task.description}</s>;
			} else {
				done = <i className="fa fa-square-o" onClick={this.toggleStatus}></i>;
				description = this.props.task.description;
			}
			return (
				<li className="list-group-item">
					<div className="row">
						<div className="col-xs-1">
							{done}
						</div>
						<div className="col-xs-10">
							{description}
						</div>
						<div className="col-xs-1">
							<i className="fa fa-times" onClick={this.deleteTask}></i>
						</div>
					</div>
				</li>
			);
		}
	});

	// TaskForm component
	var TaskForm = React.createClass({
		getInitialState: function () {
			return {
				inputValue: ""
			};
		},
		userTypes: function (event) {
			this.setState({
				inputValue: event.target.value
			});	
		},
		addOnEnter: function (event) {
			if (event.keyCode === 13) {
				this.addTask();
			}
		},
		addTask: function () {
			if (this.state.inputValue === "") {
				return;
			}
			Tasks.insert({
				description: this.state.inputValue,
				done: false
			});
			this.setState({
				inputValue: ""
			});
		},
		render: function () {
			return (
				<div className="form-group">
					<input className="form-control" placeholder="Add a task" autoFocus value={this.state.inputValue} onChange={this.userTypes} onKeyDown={this.addOnEnter} />
				</div>
			);
		}
	});



	// Render function
	function render (tasks) {
		React.renderComponent(
			<TasksApp tasks={tasks} />,
			document.getElementById("app-container")
		);
	}



	// Tasks model
	Tasks = {
		insert: function (task) {
			task._id = this._store.length;
			this._store[task._id] = task;
			this._onChange();
		},
		update: function (taskId, fields) {
			var task = this._store[taskId];
			Object.keys(fields).forEach(function (key) {
				task[key] = fields[key];
			});
			this._onChange();
		},
		remove: function (taskId) {
			delete this._store[taskId];
			this._onChange();
		},
		_store: [],
		_onChange: function () {
			render(this._store);
		}
	};



	// Bootstrap the app
	render(Tasks._store);



})();
