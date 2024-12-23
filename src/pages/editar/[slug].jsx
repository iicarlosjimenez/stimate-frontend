import Navbar from "@/components/Navbar";
import CargosContent from "@/components/tabContent/CargosContent";
import EquipoContent from "@/components/tabContent/EquipoContent";
import Funcionalidades from "@/components/tabContent/FuncionalidadesContent";
import GastosOperativos from "@/components/tabContent/GastosContent";
import Preview from "@/components/tabContent/Preview";
import TabsMenu from "@/components/TabsMenu";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";
import ProjectInterfaz from "@/interfaces/project.interface";
import Head from "next/head";
import HttpServices from "@/lib/http-services";
import Save from "@/components/Icons/Save";
import Input from "@/components/input";
import { toast } from 'react-toastify';
import { useSession } from "next-auth/react";
import {Button} from "@/components/ui/button";
import Edit from "@/components/Icons/Edit";
import formatPrice from "@/lib/formatPrice";

import { toJpeg, toPng } from 'html-to-image';
import generatePDF from 'react-to-pdf'; 

export default function TabsPages() {
  const { data: session, status } = useSession();
  const [httpServices, setHttpServices] = useState(null);
  const [isActiveSubscription, setIsActiveSubscription] = useState(false);

  const router = useRouter();
  const { slug } = router.query;
  const [activeTab, setActiveTab] = useState("equipo");
  const [project, setProject] = useState(ProjectInterfaz);
  const [isLoading, setIsLoading] = useState(true);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [estimatedWages, setEstimatedWages] = useState(0);
  const [estimatedOperatingExpenses, setEstimatedOperatingExpenses] = useState(0);
  const [estimatedAssociatedCosts, setEstimatedAssociatedCost] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [hoursTeam, setHoursTeam] = useState(null)
  const [isEditing, setIsEditing] = useState(false);
  const [originalName, setOriginalName] = useState("");

  const tabs = [
    { value: "equipo", label: "Equipo de trabajo" },
    { value: "funcionalidades", label: "Funcionalidades" },
    { value: "gastos", label: "Gastos de operación" },
    { value: "cargos", label: "Cargos asociados" },
    { value: "preview", label: "Previsualización" },
  ];

  useEffect(() => {
    if (session) {
      setHttpServices(new HttpServices(session));
      setIsActiveSubscription(session.user.isActiveSubscription)
    }
  }, [session]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const response = await httpServices.getProyect(slug);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const { data } = await response.json();
        if (data.project)
          setProject(data.project);
      } catch (error) {
        console.error("Error fetching project:", error);
        if (error.message.includes('token')) {
          router.push('/iniciar-sesion');
        }
        // Aquí podrías manejar el error, por ejemplo, mostrando un mensaje al usuario
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [slug, httpServices, status]);
  

  useEffect(() => {
    const summary = () => {
      const teamHoursMap = {};

      project.features_project.forEach((feature) => {
        feature.team_features.forEach((teamFeature) => {
          const { team, time } = teamFeature;
          if (teamHoursMap[team]) {
            teamHoursMap[team] += time;
          } else {
            teamHoursMap[team] = time;
          }
        });
      });
    
      // Tiempos por equipo
      const teamHoursArray = Object.entries(teamHoursMap).map(([team, totalTime]) => {
        // Buscar costo por hora del area
        const team_project = project.team_project.find(team_project => team_project.team == team)
        const wage = !!team_project?.hourly_rate ? totalTime * team_project.hourly_rate : 0
        const totalDailyWorkHours = !!team_project?.work_hours_per_day ? totalTime / team_project.work_hours_per_day : 0
        const totalWeeklyWorkHours = !!team_project?.work_hours_per_day ? totalTime / (team_project.work_hours_per_day * 5) : 0
        const totalMonthlyWorkHours = !!team_project?.work_hours_per_day ? totalTime / (team_project.work_hours_per_day * 20) : 0

        return {
          team,
          totalTime,
          wage,
          totalDailyWorkHours,
          totalWeeklyWorkHours,
          totalMonthlyWorkHours,
        }
      });

      // Salario estimado por horas
      const estimatedWage = teamHoursArray.reduce((total, team) => total += team.wage, 0)

      // Tiempo estimado en meses
      const estimatedMonthlyWork = teamHoursArray.reduce((total, team) => total += team.totalMonthlyWorkHours, 0)

      // Gasto estimado
      const estimateExpense = project.operating_expenses.reduce((total, expense) => total += expense.total_per_month * estimatedMonthlyWork, 0)

      // Gasto estimado
      const estimateAssociatedCost = project.associated_costs.reduce((total, cost) => total += cost.price_unity * cost.quantity, 0)

      project.sale_comission_total = (project.sale_comission / 100) * estimatedWage
      project.profit_total = (project.profit / 100) * (estimatedWage + estimateExpense + estimateAssociatedCost)
      project.tax_total = (estimatedWage + estimateExpense + estimateAssociatedCost + project.sale_comission_total + project.profit_total) * (project.tax / 100)

      setHoursTeam(teamHoursArray)
      setEstimatedWages(estimatedWage)
      setEstimatedTime(estimatedMonthlyWork)
      setEstimatedOperatingExpenses(estimateExpense)
      setEstimatedAssociatedCost(estimateAssociatedCost)
      setEstimatedCost(
        estimatedWage +
        estimateExpense +
        estimateAssociatedCost +
        (!isNaN(project.sale_comission_total) ? project.sale_comission_total : 0) +
        (!isNaN(project.profit_total) ? project.profit_total : 0) +
        (!isNaN(project.tax_total) ? project.tax_total : 0)
      )
    };

    summary()
  }, [project])

  useEffect(() => {
    if (project.name_project) {
      document.title = project.name_project;
    }
  }, [project.name_project]);

  const updateTeamProject = (updatedTeamProject) => {
    // Actualiza el equipo
    const updatedProject = {
      ...project,
      team_project: updatedTeamProject
    };

    // Actualiza las funcionalidades
    const updatedFeaturesProject = project.features_project.map(feature => {

      // Para cada funcionalidad, creamos un nuevo array de team_features
      const updatedTeamFeatures = updatedTeamProject.map((newTeam, newIndex) => {

        // Buscamos si existe un tiempo previo para este equipo
        const existingTeamFeature = feature.team_features.find(
          (tf, indexTeamFeature) => {
            const originalTeamIndex = project.team_project.findIndex(
              originalTeam => originalTeam.team === tf.team
            );
            return originalTeamIndex === newIndex;
          }
        );

        // Si existe, mantenemos el tiempo, si no, usamos 0
        return {
          team: newTeam.team,
          time: existingTeamFeature ? existingTeamFeature.time : 0
        };
      });

      // Retorna la funcionalidad actualizada
      return {
        ...feature,
        team_features: updatedTeamFeatures
      };
    });

    // Actualiza el estado completo del proyecto
    setProject({
      ...updatedProject,
      features_project: updatedFeaturesProject
    });
  }

  const onUpdateAssociatedCosts = (associatedCost) => {
    setProject((prevProject) => ({
      ...prevProject,
      associated_costs: associatedCost
    }))
  }

  const updateFeaturesProject = (featuresProject) => {
    setProject((prevProject) => ({
      ...prevProject,
      features_project: featuresProject,
    }));
  }
  const onUpdateOperatingExpenses = (operatingExpenses) => {
    setProject((prevProject) => ({
      ...prevProject,
      operating_expenses: operatingExpenses
    }));
  };

  const updatePreview = (preview) => {
    setProject((prevProject) => ({
      ...prevProject,
      name_project: preview.name_project,
      status_project: preview.status_project,
      sale_comission: preview.sale_comission,
      profit: preview.profit,
      tax: preview.tax,
      notes: preview.notes
    }));
  }

  // Parametro optionSelected: PDF o JPG
  const exportProject = async (elementToExport, optionSelected) => {

    // Verificamos si faltan campos requeridos
    const missingTProject =
      project.team_project.length === 0 || project.team_project.some(team =>
        team.hourly_rate <= 0 || team.work_hours_per_day <= 0 || team.team == ""
      );
    // Verificación por feature
    let missingSumFeature = false
    project.features_project.forEach(feature => {
      const sumPerFeature = feature.team_features.reduce((total, team) => total + (parseFloat(team.time) || 0), 0)

      if (!!!sumPerFeature) {
        missingSumFeature = true
      }
    });
    const missingFeatures = project.features_project.length === 0 || project.features_project.some(feature => feature.feature == "");
    const missingOperatingExpenses = project.operating_expenses.some(expense => expense.cost_name == "" || !!!expense.total_per_month || expense.total_per_month <= 0);
    const missingAssociatedCosts = project.associated_costs.some(cost =>
      cost.cost_name == "" || cost.description == "" || cost.price_unity <= 0 || cost.quantity <= 0 || cost.type_recurring == null);
    const missingNotes = project.notes == "";

    if (missingTProject || missingFeatures || missingOperatingExpenses || missingAssociatedCosts || missingNotes || missingSumFeature) {
      const sections = [
        { condition: missingTProject, name: "Equipo de trabajo" },
        { condition: missingFeatures, name: "Funcionalidades" },
        { condition: missingSumFeature, name: "Funcionalidades (Sumatorias)" },
        { condition: missingOperatingExpenses, name: "Gastos de operación" },
        { condition: missingAssociatedCosts, name: "Cargos asociados" },
        { condition: missingNotes, name: "Previsualización" }
      ];
      const missingSection = sections.filter(section => section.condition);
      toast.error("Faltan campos requeridos en la sección: " + missingSection.map(section => section.name).join(", "), {
        theme: "dark"
      });
      return;
    }

    // Guardamos el proyecto

    const updateProject = await httpServices.updateProyect(project)

    if (!updateProject.ok) {
      throw new Error('Failed to fetch project');
    }
    
    //TODO: Realizar exportación de proyecto
    // si el usuario es premium, exporta PDF
    if (isActiveSubscription && optionSelected == "PDF")
      exportToPDF(elementToExport)
    else 
      exportToImage(elementToExport)

    toast.success("Información guardada con éxito");
  }

  const exportToPDF = (element) => {
    const nameFile = `Cotizacion-${project.name_project}`
    const nameFilePdf = nameFile + '.pdf'
    generatePDF(element, { filename: nameFilePdf, resolution: 3, page: { margin: 0 } })
  }

  const exportToImage = (element) => {
    const nameFile = `Cotizacion-${project.name_project}`
    const nameFilePng = nameFile + '.jpg'
    toJpeg(element.current, { cacheBust: false, quality: 50, pixelRatio: 0.7, backgroundColor: 'white' })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = nameFilePng;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Validar que el nombre del proyecto no sea vacío
  const handleBlur = async () => {
    if (project.name_project === originalName) {
      setIsEditing(false);
      return;
    }

    if (!project.name_project || project.name_project.trim() === "") {
    toast.error("El nombre del proyecto no puede estar vacío",{
      theme: "dark"
    });
    setProject((prev) => ({
      ...prev,
      name_project: originalName, // Restablece el nombre original
    }));
    setIsEditing(false);
    return;
  }
  try {
    setIsEditing(false);
    const response = await httpServices.updateProyect(project);
    if (!response.ok) {
      throw new Error("Failed to update project name");
    }
    toast.success("Proyecto actualizado correctamente");
  } catch (error) {
    toast.error("Error al actualizar el nombre",{
      theme: "dark"
    });
    console.error("Error:", error);
    // Restablece el nombre original en caso de error
    setProject((prev) => ({
      ...prev,
      name_project: originalName,
    }));
  }

  };

  const renderContent = () => {
    switch (activeTab) {
      case "equipo":
        return <EquipoContent
          team_project={project.team_project}
          onUpdate={updateTeamProject} />
      case "funcionalidades":
        return <Funcionalidades
          features_project={project.features_project}
          team_project={project.team_project}
          hours_team={hoursTeam}
          onUpdate={updateFeaturesProject} />
      case "gastos":
        return <GastosOperativos
          operating_expenses={project.operating_expenses}
          estimated_time={estimatedTime}
          onUpdate={onUpdateOperatingExpenses} />
      case "cargos":
        return <CargosContent
          associated_costs={project.associated_costs}
          onUpdate={onUpdateAssociatedCosts} />
      case "preview":
        return <Preview
          project={project}
          hours_team={hoursTeam}
          estimated_wages={estimatedWages}
          estimated_operating_expenses={estimatedOperatingExpenses}
          estimated_associated_cost={estimatedAssociatedCosts}
          estimated_cost = {estimatedCost}
          onUpdate={updatePreview}
          onExport={exportProject}
          isActiveSubscription={isActiveSubscription}
        />
      default:
        return null
    }
  }

  const saveProject = async () => {
    const updateProject = await httpServices.updateProyect(project)

    if (!updateProject.ok) {
      throw new Error('Failed to fetch project');
    }
    toast.success("Información guardada");
    const { data } = await updateProject.json();
    if (data.project) {
      setProject(data.project);
    }
  }
  //Cambiar el nombre del proyecto
  const handleChangeName = (e) => {setProject(prev => ({...prev,name_project: e.target.value}))}

  if (isLoading) {
    return <Loading />;
  }

  if (!project.slug) {
  return (
    <>
      <Head>
        <title>No se encontró el proyecto</title>
      </Head>
      <Navbar />
      <div className="h-[75vh] flex justify-center items-center font-comfortaa bg-white md:text-lg">
        No se encontró el proyecto
      </div>;
    </>
  )
}

  return (
    <>
      <Head>
        <title>{project.name_project}</title>
      </Head>
      <Navbar />
      <header className="sticky top-[84px] left-0 right-0 font-comfortaa md:text-lg px-4 md:px-14 lg:px-20 pt-5 bg-white z-40 shadow-lg">
        <div className="flex flex-wrap justify-between w-full">
        <div className="flex gap-2">
          <h2>Nombre del proyecto:</h2>
          {isEditing ? (
              <Input
                value={project.name_project}
                maxLength={25}
                onChange={handleChangeName}
                onBlur={handleBlur}
                className="max-w-xs"
                autoFocus
              />
            ) : (
              <strong
              onClick={() => {
                setIsEditing(true);
                setOriginalName(project.name_project); // Guardar el nombre original
              }}
              className="cursor-pointer hover:text-blue-600"
            >
              {project.name_project}
              <span className="inline-flex items-start before:content-[''] before:w-6 before:h-6 before:bg-contain before:bg-no-repeat before:bg-center before:bg-[url('/path-to-edit-icon.svg')]">
                <Edit className="w-10 h-10 text-gray-500" />
              </span>
            </strong>
          )}
        </div>
          <div className="flex gap-2">
            <h2>Tiempo estimado:</h2> <strong>{estimatedTime.toFixed(2)} meses</strong>
          </div>
          <div className="flex gap-2">
            <h2>Costo estimado:</h2> <strong>{formatPrice(estimatedCost)}</strong>
          </div>
        </div>
        <div className="w-full flex justify-between items-end gap-5 pt-5">
          <TabsMenu activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
        </div>
        <div className="fixed bottom-6 right-10" onClick={() => saveProject()}>
          <Button>
            <Save width={24} stroke="white" />
            <span className="hidden md:block text-base ml-2">Guardar</span>
          </Button>
        </div>
      </header>

      <main className="px-4 md:px-14 lg:px-20">
        {renderContent()}
      </main>
    </>
  );
}
