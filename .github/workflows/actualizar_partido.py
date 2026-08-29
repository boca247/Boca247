import os
import json
import requests
from datetime import datetime, timedelta, timezone

API_KEY = os.environ.get("API_FOOTBALL_KEY")

BASE_URL = "https://v3.football.api-sports.io"

HEADERS = {
    "x-apisports-key": API_KEY
}

BOCA_ID = 1941


def consultar(endpoint, parametros):

    respuesta = requests.get(
        BASE_URL + endpoint,
        headers=HEADERS,
        params=parametros,
        timeout=30
    )

    respuesta.raise_for_status()

    datos = respuesta.json()

    if datos.get("errors"):
        raise Exception(str(datos["errors"]))

    return datos.get("response", [])


def guardar_partido(datos):

    with open(
        "partido.json",
        "w",
        encoding="utf-8"
    ) as archivo:

        json.dump(
            datos,
            archivo,
            ensure_ascii=False,
            indent=2
        )


def obtener_partido():

    ahora = datetime.now(timezone.utc)

    desde = (
        ahora - timedelta(days=3)
    ).strftime("%Y-%m-%d")

    hasta = (
        ahora + timedelta(days=7)
    ).strftime("%Y-%m-%d")

    partidos = consultar(
        "/fixtures",
        {
            "team": BOCA_ID,
            "from": desde,
            "to": hasta,
            "season": 2026
        }
    )

    if not partidos:

        guardar_partido({
            "estado": "SIN PARTIDO",
            "local": "Boca Juniors",
            "visitante": "",
            "resultado": "-",
            "competencia": "",
            "minuto": "",
            "incidencias": []
        })

        print("No se encontraron partidos.")
        return

    partidos.sort(
        key=lambda partido:
        partido["fixture"]["date"]
    )

    partido_en_vivo = None
    partido_finalizado = None
    partido_proximo = None

    estados_vivo = [
        "1H",
        "HT",
        "2H",
        "ET",
        "BT",
        "P"
    ]

    estados_finales = [
        "FT",
        "AET",
        "PEN"
    ]

    for partido in partidos:

        estado = partido[
            "fixture"
        ][
            "status"
        ][
            "short"
        ]

        if estado in estados_vivo:

            partido_en_vivo = partido
            break

        if estado in estados_finales:

            partido_finalizado = partido

        elif partido_proximo is None:

            partido_proximo = partido

    if partido_en_vivo:

        partido = partido_en_vivo

    elif partido_proximo:

        partido = partido_proximo

    elif partido_finalizado:

        partido = partido_finalizado

    else:

        partido = partidos[-1]

    fixture_id = partido[
        "fixture"
    ][
        "id"
    ]

    local = partido[
        "teams"
    ][
        "home"
    ][
        "name"
    ]

    visitante = partido[
        "teams"
    ][
        "away"
    ][
        "name"
    ]

    goles_local = partido[
        "goals"
    ][
        "home"
    ]

    goles_visitante = partido[
        "goals"
    ][
        "away"
    ]

    estado_api = partido[
        "fixture"
    ][
        "status"
    ][
        "short"
    ]

    minuto = partido[
        "fixture"
    ][
        "status"
    ].get(
        "elapsed"
    )

    if estado_api in estados_vivo:

        estado = "EN VIVO"

    elif estado_api in estados_finales:

        estado = "FINAL"

    else:

        estado = "PROXIMO"

    if minuto:

        minuto_texto = str(minuto) + "'"

    else:

        minuto_texto = ""

    competencia = partido[
        "league"
    ][
        "name"
    ]

    incidencias = []

    eventos = consultar(
        "/fixtures/events",
        {
            "fixture": fixture_id
        }
    )

    for evento in eventos:

        tipo = evento.get(
            "type",
            ""
        )

        jugador = evento.get(
            "player",
            {}
        ).get(
            "name",
            ""
        )

        equipo = evento.get(
            "team",
            {}
        ).get(
            "name",
            ""
        )

        tiempo = evento.get(
            "time",
            {}
        )

        minuto_evento = tiempo.get(
            "elapsed"
        )

        adicional = tiempo.get(
            "extra"
        )

        if minuto_evento is None:

            minuto_evento = ""

        elif adicional:

            minuto_evento = (
                str(minuto_evento)
                + "+"
                + str(adicional)
                + "'"
            )

        else:

            minuto_evento = (
                str(minuto_evento)
                + "'"
            )

        if tipo == "Goal":

            incidencias.append({
                "minuto": minuto_evento,
                "tipo": "gol",
                "jugador": jugador,
                "detalle": equipo
            })

        elif tipo == "Card":

            detalle = evento.get(
                "detail",
                ""
            )

            detalle_lower = detalle.lower()

            if "yellow" in detalle_lower:

                incidencias.append({
                    "minuto": minuto_evento,
                    "tipo": "amarilla",
                    "jugador": jugador,
                    "detalle": equipo
                })

            elif "red" in detalle_lower:

                incidencias.append({
                    "minuto": minuto_evento,
                    "tipo": "roja",
                    "jugador": jugador,
                    "detalle": equipo
                })

        elif tipo == "subst":

            jugador_sale = jugador

            jugador_entra = evento.get(
                "assist",
                {}
            ).get(
                "name",
                ""
            )

            incidencias.append({
                "minuto": minuto_evento,
                "tipo": "cambio",
                "jugador": jugador_entra,
                "detalle":
                    "Entra: "
                    + jugador_entra
                    + " | Sale: "
                    + jugador_sale
            })

    datos = {

        "estado": estado,

        "fixture_id": fixture_id,

        "local": local,

        "visitante": visitante,

        "resultado":
            str(goles_local or 0)
            + "-"
            + str(goles_visitante or 0),

        "competencia": competencia,

        "minuto": minuto_texto,

        "incidencias": incidencias

    }

    guardar_partido(datos)

    print("PARTIDO ACTUALIZADO")
    print(local)
    print(goles_local or 0)
    print("-")
    print(goles_visitante or 0)
    print(visitante)
    print("Estado:", estado)
    print("Incidencias:", len(incidencias))


if __name__ == "__main__":

    if not API_KEY:

        raise Exception(
            "Falta configurar API_FOOTBALL_KEY"
        )

    obtener_partido()
