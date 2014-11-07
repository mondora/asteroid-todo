/** @jsx React.DOM */

(function () {



	// TaskApp component
	var TasksApp = React.createClass({
		formOrButton: function () {
			return Ceres.userId ? <TaskForm /> : <LoginButton />;
		},
		render: function () {
			return (
				<div className="col-xs-12 col-sm-6 col-sm-offset-3">
					<h3>asteroid todo</h3>
					<br />
					{this.formOrButton()}
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
						<div className="col-xs-5">
							{description}
						</div>
						<div className="col-xs-5">
							{this.props.task.userName}
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
			var user = Users.reactiveQuery({_id: Ceres.userId}).result[0];
			Tasks.insert({
				userId: user._id,
				userName: user.profile.name,
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

	var LoginButton = React.createClass({
		login: function () {
			chrome.runtime.sendMessage("login");
		},
		render: function () {
			return (
				<div className="form-group">
					<button className="btn btn-block btn-default" onClick={this.login}>Login</button>
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



	var Ceres = new Asteroid("localhost:3000");
	Ceres.subscribe("tasks");
	var Tasks = Ceres.getCollection("tasks");
	var Users = Ceres.getCollection("users");

	var tasksRQ = Tasks.reactiveQuery({});
	tasksRQ.on("change", function () {
		render(tasksRQ.result);
	});

	Ceres.on("login", function () {
		render(tasksRQ.result);
	});

	// Bootstrap the app
	render(tasksRQ.result);



})();
