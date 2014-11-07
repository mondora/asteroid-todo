var Tasks = new Meteor.Collection("tasks");

var ownsTask = function (userId, task) {
	return (
		userId &&
		task.userId === userId
	);
};
Tasks.allow({
	insert: ownsTask,
	update: function (userId, task, fields) {
		return (
			ownsTask(userId, task) &&
			!_.contains(fields, "userId")
		);
	},
	remove: ownsTask
});

if (Meteor.isClient) {

	Meteor.subscribe("tasks");

	Template.TaskForm.events({
		"keydown input": function (e) {
			if (e.keyCode !== 13) {
				return;
			}
			Tasks.insert({
				userId: Meteor.userId(),
				userName: Meteor.user().profile.name,
				description: e.target.value,
				done: false
			});
			e.target.value = "";
		}
	});

	Template.TasksList.helpers({
		tasks: function () {
			return Tasks.find();
		}
	});

	Template.TaskSummary.helpers({
		checkboxClass: function () {
			return Template.instance().data.done ? "fa-check-square-o" : "fa-square-o";
		}
	});

	Template.TaskSummary.events({
		"click .remove": function () {
			var task = Template.instance().data;
			Tasks.remove(task._id);
		},
		"click .toggle": function () {
			var task = Template.instance().data;
			Tasks.update(task._id, {
				$set: {
					done: !task.done
				}
			});
		}
	});

	Template.LoginButton.events({
		"click button": function () {
			Meteor.loginWithFacebook();
		}
	});

}

if (Meteor.isServer) {

	Meteor.publish("tasks", function () {
		return Tasks.find();
	});

}
